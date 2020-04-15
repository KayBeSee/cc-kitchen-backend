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

const getUTXOByAddress = (txFromBlockstream, scriptPubKeyAddress) => {
  return txFromBlockstream.vout.filter((out) => out.scriptpubkey_address === scriptPubKeyAddress)[0];
}

// From Caravan
const SCRIPT_PUB_KEY_ADDRESS = "tb1qfptyhh3zr2h3cwv882fttgmuuyahp00zj68k8awgc5wz4yrdv3tqy94q23";
const WITNESS_SCRIPT = "52210283ac6d2c54f377b8cf73aeafa24bd10f9537f029a2fbae7f2ac1decb2bfb64d921034e73d173c72796da4fbfb491e8477639dd5b3c94b34f9879a49a61bc0574c5c221034f3c7c8255c82a3ff785c381e9d414f2363f66ddd4401570e27cf6db7e013a3f53ae"
const UNSIGNED_TRANSACTION = "010000000192a975198c69cb3ec075c06e3f8c5b06bd3ba5df8cf470b63d496a456dd285b50000000000ffffffff02701700000000000017a914ffd0dbb44402d5f8f12d9ba5b484a2c1bb47da4287420d000000000000220020cab334e4d7aa7899d26d7e2830e493ba2c225635df1735b7ffa6c8ffa5b42cd400000000";

// Master XPub (m)
// const JB_XPUB = "tpubD6NzVbkrYhZ4Yos4KiTCexKCkKGmzLwfExUXxXE2qq8ky9Ky9uZE1Xbctzk2rhduQntdCeg47MLRQ7zM1rUAH3RHRaSFHfHpyrvLb5Fzrg9"; // xfp (9130C3D6)
// const DAS_XPUB = "tpubD6NzVbkrYhZ4XBQLfAgvNCzqCbKu3ZpRJqMPBxYBn7Gw92P9tF8xxQicgEWpSeT3seaFAVwcdc1Wo5DK7fJRi2qPDtSENyzAfbP9xNKnT86"; // xfp (34ECF56B)
// const SUNNY_XPUB = "tpubD6NzVbkrYhZ4XLEhtbB4e4AbTH4ZbXB77Nuu23WGDwyHa6S8EfWpnx268EWP4wQhas1N9ByWSCsPvjh9ArmNk2NnoXaSFioxw29z6z1xNbe"; // xfp (4F60D1C9)

// XPub (m/48'/1'/0'/2')
const JB_XPUB = "tpubDDv6Az73JkvvPQPFdytkRrizpdxWtHTE6gHywCRqPu3nz2YdHDG5AnbzkJWJhtYwEJDR3eENpQQZyUxtFFRRC2K1PEGdwGZJYuji8QcaX4Z"; // xfp (9130C3D6)
const DAS_XPUB = "tpubDECB21DPAjBvUtqSCGWHJrbh6nSg9JojqmoMBuS5jGKTFvYJb784Pu5hwq8vSpH6vkk3dZmjA3yR7mGbrs3antkL6BHVHAyjPeeJyAiVARA"; // xfp (34ECF56B)
const SUNNY_XPUB = "tpubDFR1fvmcdWbMMDn6ttHPgHi2Jt92UkcBmzZ8MX6QuoupcDhY7qoKsjSG2MFvN66r2zQbZrdjfS6XtTv8BjED11hUMq3kW2rc3CLTjBZWWFb"; // xfp (4F60D1C9)

const PATH_FROM_XPUB = "m/0/1";
const PATH_FROM_MASTER_XPUB = "m/48'/1'/0'/2'/0/1";

const main = async () => {
  const tx = Transaction.fromHex(UNSIGNED_TRANSACTION);

  const psbt = new Psbt();
  psbt.setVersion(2);
  psbt.setLocktime(0);

  for (let i = 0; i < tx.ins.length; i++) {
    const txId = tx.ins[i].hash.reverse().toString('hex');
    const txFromBlockstream = await (await axios.get(blockExplorerAPIURL(`/tx/${txId}`, TESTNET))).data;

    const inputUtxo = getUTXOByAddress(txFromBlockstream, SCRIPT_PUB_KEY_ADDRESS);

    const jbHDInterface = bip32.fromBase58(JB_XPUB, networks.testnet);
    const dasHDInterface = bip32.fromBase58(DAS_XPUB, networks.testnet);
    const sunnyHDInterface = bip32.fromBase58(SUNNY_XPUB, networks.testnet);


    console.log('deriveChildPublicKey(JB_XPUB, PATH_FROM_XPUB, TESTNET): ', deriveChildPublicKey(JB_XPUB, PATH_FROM_XPUB, TESTNET));
    console.log('deriveChildPublicKey(DAS_XPUB, PATH_FROM_XPUB, TESTNET): ', deriveChildPublicKey(DAS_XPUB, PATH_FROM_XPUB, TESTNET));
    console.log('deriveChildPublicKey(SUNNY_XPUB, PATH_FROM_XPUB, TESTNET): ', deriveChildPublicKey(SUNNY_XPUB, PATH_FROM_XPUB, TESTNET));


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

  // return psbt.toBase64();
  console.log('psbt: ', psbt.data);
  console.log('psbt hex base64: ', psbt.toBase64());
  // return psbt.toBase64();

  // Pause here...
  // SIGN USING COLD CARD
  // 

  // // Signed PSBT from DAS
  // const dasSignedTx =
  //   "cHNidP8BAFMCAAAAAZFDNDY7N5Xsl/73N+pJiw3TMTpKRGCBLtiB33Tc40guAQAAAAD/////ARglAAAAAAAAF6kU/9DbtEQC1fjxLZultISiwbtH2kKHAAAAAAABASsQJwAAAAAAACIAIFQoMpijt4/hu4lpgWa9XQUP3neGeH8G3PRpJ5kGqyztIgID2bNgYSscEMp+qqYr/lXEYoXv/xX7QQakJPB/mC5mjtxIMEUCIQDc/fx6KkbpZmjCL/0j927zl/5N7JtEsHsq5Yl3n1N53QIgFLstsNdl5c3OiA/9ZMWU1TBeDIYc0+Ao7XOn3mHHepgBAQMEAQAAAAEFaVIhAyIEErL0BQQffuTOA9kTjyEC+eybnl5zNuAf6pdxUq06IQPZs2BhKxwQyn6qpiv+VcRihe//FftBBqQk8H+YLmaO3CED5COMlBMA/fsBELla1MfIEB6gGi5qERqdqQsCA8I8FFdTriIGAyIEErL0BQQffuTOA9kTjyEC+eybnl5zNuAf6pdxUq06HE9g0ckwAACAAQAAgAAAAIACAACAAAAAAAAAAAAiBgPZs2BhKxwQyn6qpiv+VcRihe//FftBBqQk8H+YLmaO3ByRMMPWMAAAgAEAAIAAAACAAgAAgAAAAAAAAAAAIgYD5COMlBMA/fsBELla1MfIEB6gGi5qERqdqQsCA8I8FFccNOz1azAAAIABAACAAAAAgAIAAIAAAAAAAAAAAAABABepFP/Q27REAtX48S2bpbSEosG7R9pChwA=";

  // // Signed PSBT from JB
  // const jbSignedTx =
  //   "cHNidP8BAFMCAAAAAZFDNDY7N5Xsl/73N+pJiw3TMTpKRGCBLtiB33Tc40guAQAAAAD/////ARglAAAAAAAAF6kU/9DbtEQC1fjxLZultISiwbtH2kKHAAAAAAABASsQJwAAAAAAACIAIFQoMpijt4/hu4lpgWa9XQUP3neGeH8G3PRpJ5kGqyztIgIDIgQSsvQFBB9+5M4D2ROPIQL57JueXnM24B/ql3FSrTpHMEQCIBwOD3rTGszZ/NF87BFsG1IlQunOQBmztzN6s4i4uJIsAiBBcRushOJLfeCASfkxn30sDumNC40rP89iGXzjql16ugEBAwQBAAAAAQVpUiEDIgQSsvQFBB9+5M4D2ROPIQL57JueXnM24B/ql3FSrTohA9mzYGErHBDKfqqmK/5VxGKF7/8V+0EGpCTwf5guZo7cIQPkI4yUEwD9+wEQuVrUx8gQHqAaLmoRGp2pCwIDwjwUV1OuIgYDIgQSsvQFBB9+5M4D2ROPIQL57JueXnM24B/ql3FSrTocT2DRyTAAAIABAACAAAAAgAIAAIAAAAAAAAAAACIGA9mzYGErHBDKfqqmK/5VxGKF7/8V+0EGpCTwf5guZo7cHJEww9YwAACAAQAAgAAAAIACAACAAAAAAAAAAAAiBgPkI4yUEwD9+wEQuVrUx8gQHqAaLmoRGp2pCwIDwjwUVxw07PVrMAAAgAEAAIAAAACAAgAAgAAAAAAAAAAAAAEAF6kU/9DbtEQC1fjxLZultISiwbtH2kKHAA==";

  // const dasFinal = Psbt.fromBase64(dasSignedTx);
  // const jbFinal = Psbt.fromBase64(jbSignedTx);

  // psbt.combine(dasFinal, jbFinal);

  // psbt.finalizeAllInputs();

  // console.log('psbt.extractTransaction(): ', psbt.extractTransaction());
  // console.log('psbt.extractTransaction().toHex(): ', psbt.extractTransaction().toHex());

  // return psbt.extractTransaction.toHex();
}

main();