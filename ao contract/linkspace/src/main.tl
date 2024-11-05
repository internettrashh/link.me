-- src/main.tl

require "globals"
local json = require "json"

-- Type definitions

global record ResponseData
  Target: string
  Action: string
  Data: string
end

global record ErrorResponse
  message: string
end

global record SuccessRegistrationResponse
  message: string
  undername: string
  transactionId: string
end

global record UserResponse
  user: UserRecord
end



-- Key types for json decoding
global type JsonANTRecord = {string: json.Value}
global type JsonRegisterRequest = {string: json.Value}
global type JsonGetUsersRequest = {string: json.Value}
global type JsonUpdateRequest = {string: json.Value}


-- Helper function to send a response
local function sendResponse(target: string, action: string, data: any): ResponseData
  return {
    Target = target,
    Action = action,
    Data = json.encode(data)
  }
end

local function errorHandler(err: any): nil
  print("Critical error occurred: " .. tostring(err))
  print(debug.traceback())
end

local function wrapHandler(handlerFn: function(msg: Message)): function(msg: Message)
  return function(msg: Message): nil
    local success = xpcall(function(): any return handlerFn(msg) end, errorHandler)
    if not success then
      if msg.Sender == nil then
        ao.send(sendResponse(msg.From, "Error", {message = "An unexpected error occurred. Please try again later."}))
      else
        ao.send(sendResponse(msg.Sender, "Error", {message = "An unexpected error occurred. Please try again later."}))
      end
    end
  end
end

-- Validation functions
local function isValidUndername(undername: string): boolean
  local isValid = undername:match("^[%w-_]+$") ~= nil
  print("[DEBUG] Validating undername: " .. tostring(undername) .. " Result: " .. tostring(isValid))
  return isValid
end

local function isValidTransactionId(txId: string): boolean
  local isValid = type(txId) == "string" and #txId == 43
  print("[DEBUG] Validating transaction ID: " .. tostring(txId) .. " Result: " .. tostring(isValid))
  return isValid
end

local function isContractOwner(address: string): boolean
  local isOwner = address == ao.env.Process.Owner or address == ao.id
  print("[DEBUG] Checking contract owner - Address: " .. tostring(address) .. " Is owner: " .. tostring(isOwner))
  return isOwner
end

local function setANTRecord(undername: string, txId: string): nil
  print("[DEBUG] Setting ANT record - Undername: " .. tostring(undername) .. " TxID: " .. tostring(txId))
  ao.send({
    Target = ContractInUse,
    Tags = {
      { name = "Action", value = "Set-Record" },
      { name = "Sub-Domain", value = undername },
      { name = "Transaction-Id", value = txId },
      { name = "TTL-Seconds", value = "3600" }
    }
  })
end
-- Add handlers

-- Info handler
Handlers.add(
  "getInfo",
  Handlers.utils.hasMatchingTag("Action", "Info"),
  wrapHandler(function(msg: Message)
    print("[DEBUG] Info handler called")
    ao.send(sendResponse(msg.From, "Info", {version = Variant}))
  end)
)

-- Remove the separate "register" and "update" handlers and replace with this combined handler
Handlers.add(
  "registerOrUpdate",
  Handlers.utils.hasMatchingTag("Action", "Register"),
  wrapHandler(function(msg: Message)
    print("[DEBUG] Register/Update handler called")
    local decoded: json.Value = json.decode(msg.Data)
    print("[DEBUG] Decoded message data:")
    print(json.encode(decoded))  -- Print table separately
    
    if type(decoded) ~= "table" then
      print("[ERROR] Invalid request format received")
      local errorResponse: ErrorResponse = { message = "Invalid request format" }
      ao.send(sendResponse(msg.From, "Error", errorResponse))
      return
    end
    
    local request = decoded as {string: json.Value}
    local undername = request.undername as string
    local txId = request.transactionId as string
    local isExistingUser = State_users[msg.From] ~= nil
    
    print("[DEBUG] Processing registration - Undername: " .. tostring(undername) .. " TxID: " .. tostring(txId))
    print("[DEBUG] Existing user? " .. tostring(isExistingUser))
    
    if not isValidTransactionId(txId) then
      print("[ERROR] Invalid transaction ID format")
      local errorResponse: ErrorResponse = { message = "Invalid transaction ID format" }
      ao.send(sendResponse(msg.From, "Error", errorResponse))
      return
    end

    if not isExistingUser then
      if not undername or not isValidUndername(undername) then
        print("[ERROR] Invalid undername format")
        local errorResponse: ErrorResponse = { message = "Invalid undername format" }
        ao.send(sendResponse(msg.From, "Error", errorResponse))
        return
      end

      if Taken_undernames[undername] then
        print("[ERROR] Undername already taken: " .. tostring(undername))
        local errorResponse: ErrorResponse = { message = "Undername already taken" }
        ao.send(sendResponse(msg.From, "Error", errorResponse))
        return
      end
    else
      if undername and undername ~= State_users[msg.From].undername then
        print("[ERROR] Attempt to change undername for existing user")
        local errorResponse: ErrorResponse = { message = "Cannot change undername for existing users" }
        ao.send(sendResponse(msg.From, "Error", errorResponse))
        return
      end
      undername = State_users[msg.From].undername
    end

    if not isExistingUser then
      Taken_undernames[undername] = true
      print("[DEBUG] Marked undername as taken: " .. tostring(undername))
    end

    State_users[msg.From] = {
      undername = undername,
      transactionId = txId
    }
    print("[DEBUG] Updated State_users for address: " .. tostring(msg.From))

    local successResponse: SuccessRegistrationResponse = {
      message = isExistingUser and "Update successful" or "Registration successful",
      undername = undername,
      transactionId = txId
    }
    ao.send(sendResponse(msg.From, "Success", successResponse))
    
    print("[DEBUG] Setting ANT record")
    setANTRecord(undername, txId)
  end)
)

-- Get Users handler
Handlers.add(
  "getUsers",
  Handlers.utils.hasMatchingTag("Action", "GetUsers"),
  wrapHandler(function(msg: Message)
    print("[DEBUG] GetUsers handler called")
    local decoded: json.Value = json.decode(msg.Data)
    print("[DEBUG] Decoded request:")
    print(json.encode(decoded))  -- Print table separately
    
    if type(decoded) ~= "table" then
      print("[ERROR] Invalid request format in GetUsers")
      local errorResponse: ErrorResponse = { message = "Invalid request format" }
      ao.send(sendResponse(msg.From, "Error", errorResponse))
      return
    end
    
    local request = decoded as {string: json.Value}
    local address = request.address as string
    print("[DEBUG] Requested address: " .. tostring(address))

    if address then
      print("[DEBUG] Looking up specific user: " .. tostring(address))
      if State_users[address] then
        print("[DEBUG] User found:")
        print(json.encode(State_users[address]))  -- Print table separately
        local userResponse: UserResponse = {
          user = State_users[address]
        }
        ao.send(sendResponse(msg.From, "Success", userResponse))
      else
        print("[DEBUG] User not found for address: " .. tostring(address))
        local errorResponse: ErrorResponse = {
          message = "User not found"
        }
        ao.send(sendResponse(msg.From, "Error", errorResponse))
      end
    else
      local userCount = 0
      for _ in pairs(State_users) do
          userCount = userCount + 1
      end
      print("[DEBUG] Returning all users, count: " .. tostring(userCount))
      local usersResponse: UsersResponse = {
          users = State_users
      }
      ao.send(sendResponse(msg.From, "Success", usersResponse))
    end
  end)
)

-- Update removeRecord handler to use local state
Handlers.add(
  "removeRecord",
  Handlers.utils.hasMatchingTag("Action", "Remove-Record"),
  wrapHandler(function(msg: Message)
    print("[DEBUG] RemoveRecord handler called")
    
    local decoded: json.Value = json.decode(msg.Data)
    print("[DEBUG] Decoded removal request:")
    print(decoded)  -- Print table separately
    
    if type(decoded) ~= "table" then
      print("[ERROR] Invalid request format in removal")
      local errorResponse: ErrorResponse = { message = "Invalid request format" }
      ao.send(sendResponse(msg.From, "Error", errorResponse))
      return
    end
    
    local request = decoded as {string: json.Value}
    local undername = request.undername as string
    print("[DEBUG] Attempting to remove undername: " .. tostring(undername))

    -- Check if the undername is valid
    if not undername or not isValidUndername(undername) then
      print("[ERROR] Invalid undername format in removal request")
      local errorResponse: ErrorResponse = { message = "Invalid undername format" }
      ao.send(sendResponse(msg.From, "Error", errorResponse))
      return
    end

    -- Check if the record exists
    if not Taken_undernames[undername] then
      print("[ERROR] Attempt to remove non-existent record: " .. tostring(undername))
      local errorResponse: ErrorResponse = { message = "Record not found" }
      ao.send(sendResponse(msg.From, "Error", errorResponse))
      return
    end

    -- Find the owner of the undername
    local underNameOwnerAddress = ""
    for address, user in pairs(State_users) do
      if user.undername == undername then
        underNameOwnerAddress = address
        break
      end
    end

    -- Check authorization
    local isOwner = isContractOwner(msg.From)
    local isSelfDeletion = msg.From or msg.Sender == underNameOwnerAddress

    if not (isOwner or isSelfDeletion) then
      print("[ERROR] Unauthorized removal attempt from: " .. tostring(msg.From))
      local errorResponse: ErrorResponse = { 
        message = "Unauthorized: Only contract owner or the undername owner can remove this record" 
      }
      ao.send(sendResponse(msg.From, "Error", errorResponse))
      return
    end

    -- Proceed with deletion
    Taken_undernames[undername] = nil
    print("[DEBUG] Removed undername from Taken_undernames: " .. tostring(undername))
    
    -- Remove from State_users
    if underNameOwnerAddress then
      State_users[underNameOwnerAddress] = nil
      print("[DEBUG] Removed user from State_users - Address: " .. tostring(underNameOwnerAddress))
    end

    local successResponse = {
      message = "Record successfully removed",
      undername = undername,
      deletedBy = isSelfDeletion and "user" or "contract_owner"
    }
    ao.send(sendResponse(msg.From, "Success", successResponse))

    print("[DEBUG] Sending removal request to ANT contract")
    ao.send({
      Target = ContractInUse,
      Tags = {
        { name = "Action", value = "Remove-Record" },
        { name = "Sub-Domain", value = undername }
      }
    })
  end)
)
print("[INFO] linkspace process initialized")
