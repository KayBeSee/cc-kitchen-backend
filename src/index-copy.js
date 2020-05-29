import "regenerator-runtime/runtime";

import axios from 'axios';
import { Psbt, Transaction, bip32, networks } from 'bitcoinjs-lib';
import {
  deriveChildPublicKey,
  blockExplorerAPIURL,
  deriveChildExtendedPublicKey,
  getFingerprintFromPublicKey,
  deriveExtendedPublicKey,
  TESTNET
} from "unchained-bitcoin";

import {
  JB_XPUB,
  DAS_XPUB,
  SUNNY_XPUB,
  SCRIPT_PUB_KEY_ADDRESS,
  WITNESS_SCRIPT,
  UNSIGNED_TRANSACTION,
  PATH_FROM_XPUB,
  PATH_FROM_MASTER_XPUB,
} from './config';
import { finalizePsbt } from "./utils/transasction-utils";

const getUTXOByAddress = (txFromBlockstream, scriptPubKeyAddress) => {
  return txFromBlockstream.vout.filter((out) => out.scriptpubkey_address === scriptPubKeyAddress)[0];
}

const main = async () => {
  const tx = Transaction.fromHex(UNSIGNED_TRANSACTION);

  const psbt = new Psbt();
  psbt.setVersion(2);
  psbt.setLocktime(0);

  for (let i = 0; i < tx.ins.length; i++) {
    const txId = tx.ins[i].hash.reverse().toString('hex');
    const txFromBlockstream = await (await axios.get(blockExplorerAPIURL(`/tx/${txId}`, TESTNET))).data;

    const inputUtxo = getUTXOByAddress(txFromBlockstream, SCRIPT_PUB_KEY_ADDRESS);

    psbt.addInput({
      hash: Buffer.from(tx.ins[i].hash, 'hex').toString('hex'),
      index: tx.ins[i].index,
      sequence: tx.ins[i].sequence,
      witnessUtxo: {
        script: Buffer.from(
          inputUtxo.scriptpubkey,
          'hex'
        ),
        value: inputUtxo.value
      },
      witnessScript: Buffer.from(WITNESS_SCRIPT, 'hex'),
      bip32Derivation: [
        // I have these ordered by pubkey...not sure if necessary
        {
          masterFingerprint: Buffer.from("4F60D1C9", 'hex'),
          pubkey: Buffer.from(deriveChildPublicKey(SUNNY_XPUB, PATH_FROM_XPUB, TESTNET), 'hex'),
          path: PATH_FROM_MASTER_XPUB,
        },
        {
          masterFingerprint: Buffer.from("34ECF56B", 'hex'),
          pubkey: Buffer.from(deriveChildPublicKey(DAS_XPUB, PATH_FROM_XPUB, TESTNET), 'hex'),
          path: PATH_FROM_MASTER_XPUB,
        },
        {
          masterFingerprint: Buffer.from("9130C3D6", 'hex'),
          pubkey: Buffer.from(deriveChildPublicKey(JB_XPUB, PATH_FROM_XPUB, TESTNET), 'hex'),
          path: PATH_FROM_MASTER_XPUB,
        },
      ]
    });
  }


  for (let j = 0; j < tx.outs.length; j++) {
    psbt.addOutput({
      redeemScript: tx.outs[j].script,
      script: tx.outs[j].script,
      value: tx.outs[j].value
    });
  }

  console.log('psbt: ', psbt.data);
  console.log('psbt hex base64: ', psbt.toBase64());
  // return psbt.toBase64();

  // Pause here...
  // SIGN USING COLD CARD
  // 

  // Signed PSBT from DAS
  const dasSignedTx =
    "cHNidP8BAFMCAAAAAZFDNDY7N5Xsl/73N+pJiw3TMTpKRGCBLtiB33Tc40guAQAAAAD/////ARglAAAAAAAAF6kU/9DbtEQC1fjxLZultISiwbtH2kKHAAAAAAABASsQJwAAAAAAACIAIFQoMpijt4/hu4lpgWa9XQUP3neGeH8G3PRpJ5kGqyztIgID2bNgYSscEMp+qqYr/lXEYoXv/xX7QQakJPB/mC5mjtxIMEUCIQDc/fx6KkbpZmjCL/0j927zl/5N7JtEsHsq5Yl3n1N53QIgFLstsNdl5c3OiA/9ZMWU1TBeDIYc0+Ao7XOn3mHHepgBAQMEAQAAAAEFaVIhAyIEErL0BQQffuTOA9kTjyEC+eybnl5zNuAf6pdxUq06IQPZs2BhKxwQyn6qpiv+VcRihe//FftBBqQk8H+YLmaO3CED5COMlBMA/fsBELla1MfIEB6gGi5qERqdqQsCA8I8FFdTriIGAyIEErL0BQQffuTOA9kTjyEC+eybnl5zNuAf6pdxUq06HE9g0ckwAACAAQAAgAAAAIACAACAAAAAAAAAAAAiBgPZs2BhKxwQyn6qpiv+VcRihe//FftBBqQk8H+YLmaO3ByRMMPWMAAAgAEAAIAAAACAAgAAgAAAAAAAAAAAIgYD5COMlBMA/fsBELla1MfIEB6gGi5qERqdqQsCA8I8FFccNOz1azAAAIABAACAAAAAgAIAAIAAAAAAAAAAAAABABepFP/Q27REAtX48S2bpbSEosG7R9pChwA=";

  // Signed PSBT from JB
  const jbSignedTx =
    "cHNidP8BAFMCAAAAAZFDNDY7N5Xsl/73N+pJiw3TMTpKRGCBLtiB33Tc40guAQAAAAD/////ARglAAAAAAAAF6kU/9DbtEQC1fjxLZultISiwbtH2kKHAAAAAAABASsQJwAAAAAAACIAIFQoMpijt4/hu4lpgWa9XQUP3neGeH8G3PRpJ5kGqyztIgIDIgQSsvQFBB9+5M4D2ROPIQL57JueXnM24B/ql3FSrTpHMEQCIBwOD3rTGszZ/NF87BFsG1IlQunOQBmztzN6s4i4uJIsAiBBcRushOJLfeCASfkxn30sDumNC40rP89iGXzjql16ugEBAwQBAAAAAQVpUiEDIgQSsvQFBB9+5M4D2ROPIQL57JueXnM24B/ql3FSrTohA9mzYGErHBDKfqqmK/5VxGKF7/8V+0EGpCTwf5guZo7cIQPkI4yUEwD9+wEQuVrUx8gQHqAaLmoRGp2pCwIDwjwUV1OuIgYDIgQSsvQFBB9+5M4D2ROPIQL57JueXnM24B/ql3FSrTocT2DRyTAAAIABAACAAAAAgAIAAIAAAAAAAAAAACIGA9mzYGErHBDKfqqmK/5VxGKF7/8V+0EGpCTwf5guZo7cHJEww9YwAACAAQAAgAAAAIACAACAAAAAAAAAAAAiBgPkI4yUEwD9+wEQuVrUx8gQHqAaLmoRGp2pCwIDwjwUVxw07PVrMAAAgAEAAIAAAACAAgAAgAAAAAAAAAAAAAEAF6kU/9DbtEQC1fjxLZultISiwbtH2kKHAA==";

  return finalizePsbt(psbt, [jbSignedTx, dasSignedTx]);
}

main();