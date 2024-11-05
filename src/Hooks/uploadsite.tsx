import {
    TurboFactory,
    ArconnectSigner,
} from '@ardrive/turbo-sdk/web';
import { JWKInterface } from 'arweave/node/lib/wallet';
import { ReadableStream } from 'web-streams-polyfill';

// Change the Arweave import
import Arweave from 'arweave';

// Initialize Arweave correctly
const arweave = new Arweave({
    host: 'arweave.net',
    port: 443,
    protocol: 'https',
    timeout: 20000,
    logging: false,
});

// Enable debug logs
TurboFactory.setLogLevel('debug');

interface UploadResult {
    success: boolean;
    txId?: string;
    dataCaches?: string[];
    fastFinalityIndexes?: string[];
    error?: string;
    wallet?: JWKInterface;
    address?: string;
}

export const uploadHtmlFile = async (html: string): Promise<UploadResult> => {
    try {
        // Generate a random wallet
        const wallet: JWKInterface = await arweave.wallets.generate();
        const address = await arweave.wallets.getAddress(wallet);
        
        // Create authenticated Turbo client
        const turbo = TurboFactory.authenticated({
            privateKey: wallet,
        });

        // Convert HTML string to Uint8Array
        const encoder = new TextEncoder();
        const htmlBuffer = encoder.encode(html);

        // Upload the file using Turbo
        const uploadResult = await turbo.uploadFile({
            fileStreamFactory: () =>
                new ReadableStream({
                    start(controller) {
                        controller.enqueue(htmlBuffer);
                        controller.close();
                    },
                }),
            fileSizeFactory: () => htmlBuffer.length,
            dataItemOpts: {
                tags: [
                    { name: 'Content-Type', value: 'text/html' },
                    { name: 'App-Name', value: 'ArDrive' }
                ]
            }
        });

        return {
            success: true,
            txId: uploadResult.id,
            dataCaches: uploadResult.dataCaches,
            fastFinalityIndexes: uploadResult.fastFinalityIndexes,
            wallet,
            address
        };
    } catch (error) {
        console.error('Error uploading HTML file:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
};

export async function uploadHtmlFolder(files: File[]) {
    try {
        const signer = new ArconnectSigner(window.arweaveWallet);
        const turbo = TurboFactory.authenticated({ signer });

        const preparedFiles = await Promise.all(files.map(async (file) => {
            const blob = new Blob([await file.arrayBuffer()], { type: file.type });
            return {
                name: file.name,
                stream: () => blob.stream(),
                size: file.size
            };
        }));

        const uploadResult = await turbo.uploadFolder({
            files: preparedFiles,
            dataItemOpts: {
                tags: [
                    { name: 'App-Name', value: 'ArDrive' }
                ]
            }
        });

        return {
            success: true,
            manifest: uploadResult.manifest,
            manifestId: uploadResult.manifestResponse?.id,
            fileResponses: uploadResult.fileResponses
        };

    } catch (error) {
        console.error('Error uploading HTML folder:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
}