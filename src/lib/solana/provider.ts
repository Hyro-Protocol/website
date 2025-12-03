import {
    createSolanaRpc,
    createSolanaRpcSubscriptions,
    devnet,
    sendAndConfirmTransactionFactory,
} from '@solana/kit';
 
export const rpc = createSolanaRpc(devnet(process.env.SOLANA_RPC!));
export const rpcSubscriptions = createSolanaRpcSubscriptions(devnet(process.env.SOLANA_WS_RPC!));
export const sendAndConfirmTransaction = sendAndConfirmTransactionFactory({ rpc, rpcSubscriptions });