-- Define types
global Variant: string
global Counter: number
global Configured: boolean

-- Global state type
global type UserState = {string: UserRecord}

global record UserRecord
    undername: string
    transactionId: string
end

global record UsersResponse
    users: {string: UserRecord}
end

global AntContract: string = "hD8iM0vUz9iNB2b2OgIrRa-_k47ZXp4CZkUWVTCEmIc"
global WrappedAR: string = "xU9zFkq3X2ZQ6olwNVvr1vUWIjc3kXTWr7xKQD6dh10"
global ContractInUse: string = AntContract

if not Configured then
    
    -- Initialize state
    global State_users: UserState = {}
    
    -- Add a lookup table for quick undername checks
    global Taken_undernames: {string: boolean} = {}

    global Configured = true
end

return {}