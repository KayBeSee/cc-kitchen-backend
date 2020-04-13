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
const UNSIGNED_TRANSACTION = "01000000011456f48b5735f3e0f569eebce3024f341f79ace5b17fe7fd2ed5968ba5553b2b0100000000ffffffff025e2200000000000017a914ffd0dbb44402d5f8f12d9ba5b484a2c1bb47da4287e80300000000000022002070969926a0faa52990a46a3b2a149a65d37854b9b69f8585710190ebca5f97ef00000000";
const WITNESS_SCRIPT = "52210232c809fa8dde6baae7e61bbeb69a1299765474a9d79a8de22b59686a0c2c2fe0210279096b1ac8cc5d1e1ecb8849e93945ecbbca1a0928aee401e67515e76e7aa09a2102c337dea513af82c08256751c0ba2d7a081a7e3622d31b7096043f39568a3768453ae"
const SCRIPT_PUB_KEY_ADDRESS = "tb1q8ahn3sydm3wqzjn89gcw6n9wejhdwpnnch3t74lj9ulfdv3z54ksx4hlul";

// Master XPub (m)
const JB_XPUB = "tpubD6NzVbkrYhZ4Yos4KiTCexKCkKGmzLwfExUXxXE2qq8ky9Ky9uZE1Xbctzk2rhduQntdCeg47MLRQ7zM1rUAH3RHRaSFHfHpyrvLb5Fzrg9"; // xfp (9130C3D6)
const DAS_XPUB = "tpubD6NzVbkrYhZ4XBQLfAgvNCzqCbKu3ZpRJqMPBxYBn7Gw92P9tF8xxQicgEWpSeT3seaFAVwcdc1Wo5DK7fJRi2qPDtSENyzAfbP9xNKnT86"; // xfp (34ECF56B)
const SUNNY_XPUB = "tpubD6NzVbkrYhZ4XLEhtbB4e4AbTH4ZbXB77Nuu23WGDwyHa6S8EfWpnx268EWP4wQhas1N9ByWSCsPvjh9ArmNk2NnoXaSFioxw29z6z1xNbe"; // xfp (4F60D1C9)

// XPub (m/84'/1'/0')
// const JB_MASTER_XPUB = "tpubDD5XBcmHMUf4X6gcr6Fa7Mw1RkGD5nYKGoxsn58yTP73Wojvv6A1mBbytcoEi8sYjrTonJ3DRn7WFTjFUGCcG7uvn9L1cvuQkoNY1XKduSu"; // xfp ()
// const DAS_MASTER_XPUB = "tpubDDFbVPD9SLXFMu1uhcdkffYFxrBSVFwxRs7wpfN6jN4TADVTCd7irwPrteBBaAWLYA9bqYxNMLg93saTyWF7nSVnRV6ctzihoAZ4FhUGt8R"; // xfp ()
// const SUNNY_MASTER_XPUB = "tpubDC8DwUMUqPicSB7vhmwV9EphXkBJ1Z8QzV2iCw9RqTG3snfMJuqQPgZpHcsZG4eQZ75dgiuKf85nJobeDzbzBcc2LxcuFHKoiXrC5mDshqB"; // xfp ()

// XPub (m/48'/1'/0'/2')
// const JB_XPUB = "tpubDEwupqMfvEnTNyGnogK1ae2YjGomKCBBmkBFhCfthh6ndQpYQNZ6cTCR117zcaZCfDBUfB5bueB8Bf8VKERaXEst1knZmnTG8jxx6Ui2GfW"; // xfp (9130C3D6)
// const DAS_XPUB = "tpubDEwNbhFo33pVGiWzZN7rFtuX7XAew1Xa4MgoicGFMkYycSdHjsZKUWdHgNa2xiTrAdFUdxkfSCTrnYVtkHQhahgocpuSyS7qF3XpVm3aoGm"; // xfp (34ECF56B)
// const SUNNY_XPUB = "tpubDFkVbNr3biej2CHXhddcrKP455uN6qirB47YLkY8mueqJAVh1VTycYgZATWy4hKAciZ7GE1CyaGZMxCmzRzbFyk6qSheUJXbGfKbL63UJXM"; // xfp (4F60D1C9)

const PATH = "m/0/0";

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
          masterFingerprint: sunnyHDInterface.fingerprint,
          pubkey: Buffer.from(deriveChildPublicKey(SUNNY_XPUB, PATH, TESTNET), 'hex'),
          path: PATH,
        },
        {
          masterFingerprint: dasHDInterface.fingerprint,
          pubkey: Buffer.from(deriveChildPublicKey(DAS_XPUB, PATH, TESTNET), 'hex'),
          path: PATH,
        },
        {
          masterFingerprint: jbHDInterface.fingerprint,
          pubkey: Buffer.from(deriveChildPublicKey(JB_XPUB, PATH, TESTNET), 'hex'),
          path: PATH,
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

  // Signed PSBT from DAS
  const dasSignedTx =
    "cHNidP8BAH4CAAAAARRW9ItXNfPg9WnuvOMCTzQfeazlsX/n/S7VloulVTsrAQAAAAD/////Al4iAAAAAAAAF6kU/9DbtEQC1fjxLZultISiwbtH2kKH6AMAAAAAAAAiACBwlpkmoPqlKZCkajsqFJpl03hUubafhYVxAZDryl+X7wAAAAAAAQErECcAAAAAAAAiACA/bzjAjdxcAUpnKjDtTK7MrtcGc8Xiv1fyLz6WsiKlbSICAsM33qUTr4LAglZ1HAui16CBp+NiLTG3CWBD85Voo3aERzBEAiAaHd5825a9rKIVK0uPhOZ7eJzKjzPMx7+F5n79JElPxgIgRpXs9WEvztk3a8BtZN4oPyXRDuEOpHAHWFSgE1XfPWwBAQMEAQAAAAEFaVIhAjLICfqN3muq5+YbvraaEpl2VHSp15qN4itZaGoMLC/gIQJ5CWsayMxdHh7LiEnpOUXsu8oaCSiu5AHmdRXnbnqgmiECwzfepROvgsCCVnUcC6LXoIGn42ItMbcJYEPzlWijdoRTriIGAjLICfqN3muq5+YbvraaEpl2VHSp15qN4itZaGoMLC/gDJEww9YAAAAAAAAAACIGAnkJaxrIzF0eHsuISek5Rey7yhoJKK7kAeZ1FedueqCaDE9g0ckAAAAAAAAAACIGAsM33qUTr4LAglZ1HAui16CBp+NiLTG3CWBD85Voo3aEDDTs9WsAAAAAAAAAAAABABepFP/Q27REAtX48S2bpbSEosG7R9pChwABACIAIHCWmSag+qUpkKRqOyoUmmXTeFS5tp+FhXEBkOvKX5fvAA==";

  // Signed PSBT from JB
  const jbSignedTx =
    "cHNidP8BAH4CAAAAARRW9ItXNfPg9WnuvOMCTzQfeazlsX/n/S7VloulVTsrAQAAAAD/////Al4iAAAAAAAAF6kU/9DbtEQC1fjxLZultISiwbtH2kKH6AMAAAAAAAAiACBwlpkmoPqlKZCkajsqFJpl03hUubafhYVxAZDryl+X7wAAAAAAAQErECcAAAAAAAAiACA/bzjAjdxcAUpnKjDtTK7MrtcGc8Xiv1fyLz6WsiKlbSICAjLICfqN3muq5+YbvraaEpl2VHSp15qN4itZaGoMLC/gRzBEAiAqeRoZMFX2PpDdYqd301bsL2TvqAvW+tci9F0f1HznXgIgHpMAB1itBCItVE9oxUMUbhKKhOu8DJv1UFdzLYa9CmEBAQMEAQAAAAEFaVIhAjLICfqN3muq5+YbvraaEpl2VHSp15qN4itZaGoMLC/gIQJ5CWsayMxdHh7LiEnpOUXsu8oaCSiu5AHmdRXnbnqgmiECwzfepROvgsCCVnUcC6LXoIGn42ItMbcJYEPzlWijdoRTriIGAjLICfqN3muq5+YbvraaEpl2VHSp15qN4itZaGoMLC/gDJEww9YAAAAAAAAAACIGAnkJaxrIzF0eHsuISek5Rey7yhoJKK7kAeZ1FedueqCaDE9g0ckAAAAAAAAAACIGAsM33qUTr4LAglZ1HAui16CBp+NiLTG3CWBD85Voo3aEDDTs9WsAAAAAAAAAAAABABepFP/Q27REAtX48S2bpbSEosG7R9pChwABACIAIHCWmSag+qUpkKRqOyoUmmXTeFS5tp+FhXEBkOvKX5fvAA==";

  const dasFinal = Psbt.fromBase64(dasSignedTx);
  const jbFinal = Psbt.fromBase64(jbSignedTx);

  psbt.combine(dasFinal, jbFinal);

  psbt.finalizeAllInputs();

  console.log('psbt.extractTransaction().toHex(): ', psbt.extractTransaction());
  console.log('psbt.extractTransaction().toHex(): ', psbt.extractTransaction().toHex());

  // return psbt.extractTransaction.toHex();
}

main();