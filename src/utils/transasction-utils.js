import { Psbt } from 'bitcoinjs-lib';

export const finalizePsbt = (psbt, signedTxs) => {
  console.log('psbt, signedTxs: ', psbt, signedTxs);
  const signedPsbts = signedTxs.map((signedTx) => {
    return Psbt.fromBase64(signedTx);
  });

  signedPsbts[0].combine(...signedPsbts.slice(0));
  signedPsbts[0].finalizeAllInputs();

  // console.log('psbt.extractTransaction().toHex(): ', psbt.extractTransaction().toHex());
  return signedPsbts[0].extractTransaction().toHex();
}