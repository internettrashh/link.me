import { connect, createDataItemSigner } from "@permaweb/aoconnect";
import { createDataItemSigner as nodeCDIS } from "@permaweb/aoconnect/node";


export const AppVersion = "1.0.0";
export const AOModule = "u1Ju_X8jiuq4rX9Nh-ZGRQuYQZgV2MKLMT3CZsykk54"; // sqlite
export const AOScheduler = "_GQ33BkPtZrqxA84vM8Zk-N2aO0toNNu_C-l-rawrBA";
export const UNDERNAME_PROCESS = "K6237CpdkRfSGLYyfmRby3RNL5dSzjmZDVGCWNnP_oI";


const CommonTags = [
    { name: "App-Name", value: "ARlink" },
    { name: "App-Version", value: AppVersion },
];

export type Tag = { name: string; value: string };


export async function spawnProcess(name?: string, tags?: Tag[], newProcessModule?: string) {
    const ao = connect();

    if (tags) {
        tags = [...CommonTags, ...tags];
    } else {
        tags = CommonTags;
    }
    tags = name ? [...tags, { name: "Name", value: name }] : tags;

    const result = await ao.spawn({
        module: newProcessModule ? newProcessModule : AOModule,
        scheduler: AOScheduler,
        tags,
        signer: (window.arweaveWallet as any)?.signDataItem ? createDataItemSigner(window.arweaveWallet) : nodeCDIS(window.arweaveWallet),
    });

    return result;
}

export async function runLua(code: string, process: string, tags?: Tag[]) {
    const ao = connect();

    if (tags) {
        tags = [...CommonTags, ...tags];
    } else {
        tags = CommonTags;
    }

    // if (!window.arweaveWallet) {
    //   const dryMessage = await ao.dryrun({
    //     process,
    //     data: code,
    //     tags,
    //   });
    //   return dryMessage
    // }

    tags = [...tags, { name: "Action", value: "Eval" }];

    const message = await ao.message({
        process,
        data: code,
        signer: (window.arweaveWallet as any)?.signDataItem ? createDataItemSigner(window.arweaveWallet) : nodeCDIS(window.arweaveWallet),
        tags,
    });

    const result = await ao.result({ process, message });
    // console.log(result);
    (result as any).id = message;
    return result;
}

export async function getResults(process: string, cursor = "") {
    const ao = connect();

    const r = await ao.results({
        process,
        from: cursor,
        sort: "ASC",
        limit: 999999,
    });

    if (r.edges.length > 0) {
        const newCursor = r.edges[r.edges.length - 1].cursor;
        const results = r.edges.map((e) => e.node);
        return { cursor: newCursor, results };
    } else {
        return { cursor, results: [] };
    }
}

export async function monitor(process: string) {
    const ao = connect();

    const r = await ao.monitor({
        process,
        signer: (window.arweaveWallet as any)?.signDataItem ? createDataItemSigner(window.arweaveWallet) : nodeCDIS(window.arweaveWallet),
    });

    return r;
}

export async function unmonitor(process: string) {
    const ao = connect();

    const r = await ao.unmonitor({
        process,
        signer: (window.arweaveWallet as any)?.signDataItem ? createDataItemSigner(window.arweaveWallet) : nodeCDIS(window.arweaveWallet),
    });

    return r;
}

export function parseOutupt(out: any) {
    if (!out.Output) return out;
    const data = out.Output.data;
    const { json, output } = data;
    if (json != "undefined") {
        return json;
    }
    try {
        return JSON.parse(output);
    } catch (e) {
        return output;
    }
}
export const BAZAR = {
    // module: 'Pq2Zftrqut0hdisH_MC2pDOT6S4eQFoxGsFUzR6r350',
    // scheduler: '_GQ33BkPtZrqxA84vM8Zk-N2aO0toNNu_C-l-rawrBA',
    assetSrc: 'Fmtgzy1Chs-5ZuUwHpQjQrQ7H7v1fjsP0Bi8jVaDIKA',
    defaultToken: 'xU9zFkq3X2ZQ6olwNVvr1vUWIjc3kXTWr7xKQD6dh10',
    ucm: 'U3TjJAZWJjlWBB4KAXSHKzuky81jtyh0zqH8rUL4Wd0',
    pixl: 'DM3FoZUq_yebASPhgd8pEIRIzDW6muXEhxz5-JwbZwo',
    collectionsRegistry: 'TFWDmf8a3_nw43GCm_CuYlYoylHAjCcFGbgHfDaGcsg',
    collectionSrc: '2ZDuM2VUCN8WHoAKOOjiH4_7Apq0ZHKnTWdLppxCdGY',
    profileRegistry: 'SNy4m-DrqxWl01YqGM4sxI8qCni-58re8uuJLvZPypY',
    profileSrc: '_R2XYWDPUXVvQrQKFaQRvDTDcDwnQNbqlTd_qvCRSpQ',
  };
  export async function readHandler(args: {
    processId: string;
    action: string;
    tags?: Tag[];
    data?: any;
  }): Promise<any> {
    const ao = connect();
    const tags = [{ name: 'Action', value: args.action }];
    if (args.tags) tags.push(...args.tags);
    let data = JSON.stringify(args.data || {});
  
    const response = await ao.dryrun({
      process: args.processId,
      tags: tags,
      data: data,
    });
  
    if (response.Messages && response.Messages.length) {
      if (response.Messages[0].Data) {
        return JSON.parse(response.Messages[0].Data);
      } else {
        if (response.Messages[0].Tags) {
          return response.Messages[0].Tags.reduce((acc: any, item: any) => {
            acc[item.name] = item.value;
            return acc;
          }, {});
        }
      }
    }
  }
  
  export async function setArnsName(antProcess: string, manifestId: string, undername = '@') {
    const ao = connect();
   const msgtags = [
   

    { name: 'Action', value: 'Set-Record' },
    { name: 'Sub-Domain', value: undername },
    { name: 'Transaction-Id', value: manifestId },
    { name: 'TTL-Seconds', value: '3600' },
   ]
   try{
    const result = await ao.message({
        process: antProcess,
        tags: msgtags,
        signer: (window.arweaveWallet as any)?.signDataItem ? createDataItemSigner(window.arweaveWallet) : nodeCDIS(window.arweaveWallet),
        data: "",
    });
    console.log("set arns message officially sent out ", result);
    return result;
   }catch(e){
    console.error(e);
   }
}

export async function registerUndername(undername: string, transactionId: string) {
    const ao = connect();
    const data = JSON.stringify({
        undername,
        transactionId
    });

    try {
        const message = await ao.message({
            process: UNDERNAME_PROCESS,
            tags: [{ name: 'Action', value: 'Register' }],
            data,
            signer: (window.arweaveWallet as any)?.signDataItem ? createDataItemSigner(window.arweaveWallet) : nodeCDIS(window.arweaveWallet),
        });

        const result = await ao.result({ 
            process: UNDERNAME_PROCESS, 
            message 
        });
        console.log('register undername result', result);
        if (!result) throw new Error('No result received');
        return {
            success: true,
            message,
            result
        };
    } catch (e) {
        console.error('Error registering undername:', e);
        return {
            success: false,
            error: e instanceof Error ? e.message : 'Unknown error occurred'
        };
    }
}

export async function getUserByAddress(address: string) {
    const ao = connect();
    const data = JSON.stringify({
        address
    });

    try {
        const message = await ao.message({
            process: UNDERNAME_PROCESS,
            tags: [{ name: 'Action', value: 'GetUsers' }],
            data,
            signer: (window.arweaveWallet as any)?.signDataItem ? createDataItemSigner(window.arweaveWallet) : nodeCDIS(window.arweaveWallet),
        });

        const result = await ao.result({ 
            process: UNDERNAME_PROCESS, 
            message 
        });
        
        // Parse the result to get user data
        if (result?.Messages?.[0]?.Data) {
            try {
                const parsedData = JSON.parse(result.Messages[0].Data);
                const userData = parsedData.user;
                
                return {
                    success: true,
                    message,
                    undername: userData.undername,
                    transactionId: userData.transactionId
                };
            } catch (parseError) {
                console.error('Error parsing user data:', parseError);
                return {
                    success: false,
                    error: 'Failed to parse user data'
                };
            }
        }

        return {
            success: false,
            error: 'No user data found'
        };
      
    } catch (e) {
        console.error('Error getting user:', e);
        return {
            success: false,
            error: e instanceof Error ? e.message : 'Unknown error occurred'
        };
    }
}

export async function getAllUsers() {
    const ao = connect();
    const data = JSON.stringify({
        address: null
    });

    try {
        const message = await ao.message({
            process: UNDERNAME_PROCESS,
            tags: [{ name: 'Action', value: 'GetUsers' }],
            data,
            signer: (window.arweaveWallet as any)?.signDataItem ? createDataItemSigner(window.arweaveWallet) : nodeCDIS(window.arweaveWallet),
        });

        const result = await ao.result({ 
            process: UNDERNAME_PROCESS, 
            message 
        });

        // Parse the Messages object and extract undernames
        if (result?.Messages?.[0]?.Data) {
            try {
                const parsedData = JSON.parse(result.Messages[0].Data);
                const users = parsedData.users || {};
                const undernames = Object.values(users).map((user: any) => user.undername);
                
                return {
                    success: true,
                    message,
                    result: undernames // Now returns array of undernames: ["John", "test"]
                };
            } catch (parseError) {
                console.error('Error parsing user data:', parseError);
                return {
                    success: false,
                    error: 'Failed to parse user data'
                };
            }
        }

        return {
            success: false,
            error: 'No user data found'
        };
     
    } catch (e) {
        console.error('Error getting all users:', e);
        return {
            success: false,
            error: e instanceof Error ? e.message : 'Unknown error occurred'
        };
    }
}

export async function removeRecord(undername: string) {
    const ao = connect();
    const data = JSON.stringify({
        undername
    });

    try {
        const message = await ao.message({
            process: UNDERNAME_PROCESS,
            tags: [{ name: 'Action', value: 'Remove-Record' }],
            data,
            signer: (window.arweaveWallet as any)?.signDataItem ? createDataItemSigner(window.arweaveWallet) : nodeCDIS(window.arweaveWallet),
        });

        const result = await ao.result({ 
            process: UNDERNAME_PROCESS, 
            message 
        });
        
        if (!result) throw new Error('No result received');
        return {
            success: true,
            message,
            result
        };
    } catch (e) {
        console.error('Error removing record:', e);
        return {
            success: false,
            error: e instanceof Error ? e.message : 'Unknown error occurred'
        };
    }
}