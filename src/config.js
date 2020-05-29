// Master XPub (m)
// export const JB_XPUB = "tpubD6NzVbkrYhZ4Yos4KiTCexKCkKGmzLwfExUXxXE2qq8ky9Ky9uZE1Xbctzk2rhduQntdCeg47MLRQ7zM1rUAH3RHRaSFHfHpyrvLb5Fzrg9"; // xfp (9130C3D6)
// export const DAS_XPUB = "tpubD6NzVbkrYhZ4XBQLfAgvNCzqCbKu3ZpRJqMPBxYBn7Gw92P9tF8xxQicgEWpSeT3seaFAVwcdc1Wo5DK7fJRi2qPDtSENyzAfbP9xNKnT86"; // xfp (34ECF56B)
// export const SUNNY_XPUB = "tpubD6NzVbkrYhZ4XLEhtbB4e4AbTH4ZbXB77Nuu23WGDwyHa6S8EfWpnx268EWP4wQhas1N9ByWSCsPvjh9ArmNk2NnoXaSFioxw29z6z1xNbe"; // xfp (4F60D1C9)

// XPub (m/48'/1'/0'/2')
export const JB_XPUB = "tpubDDv6Az73JkvvPQPFdytkRrizpdxWtHTE6gHywCRqPu3nz2YdHDG5AnbzkJWJhtYwEJDR3eENpQQZyUxtFFRRC2K1PEGdwGZJYuji8QcaX4Z"; // xfp (9130C3D6)
export const DAS_XPUB = "tpubDECB21DPAjBvUtqSCGWHJrbh6nSg9JojqmoMBuS5jGKTFvYJb784Pu5hwq8vSpH6vkk3dZmjA3yR7mGbrs3antkL6BHVHAyjPeeJyAiVARA"; // xfp (34ECF56B)
export const SUNNY_XPUB = "tpubDFR1fvmcdWbMMDn6ttHPgHi2Jt92UkcBmzZ8MX6QuoupcDhY7qoKsjSG2MFvN66r2zQbZrdjfS6XtTv8BjED11hUMq3kW2rc3CLTjBZWWFb"; // xfp (4F60D1C9)

// From Caravan
export const SCRIPT_PUB_KEY_ADDRESS = "tb1qfptyhh3zr2h3cwv882fttgmuuyahp00zj68k8awgc5wz4yrdv3tqy94q23";
export const WITNESS_SCRIPT = "52210283ac6d2c54f377b8cf73aeafa24bd10f9537f029a2fbae7f2ac1decb2bfb64d921034e73d173c72796da4fbfb491e8477639dd5b3c94b34f9879a49a61bc0574c5c221034f3c7c8255c82a3ff785c381e9d414f2363f66ddd4401570e27cf6db7e013a3f53ae"
export const UNSIGNED_TRANSACTION = "010000000192a975198c69cb3ec075c06e3f8c5b06bd3ba5df8cf470b63d496a456dd285b50000000000ffffffff02701700000000000017a914ffd0dbb44402d5f8f12d9ba5b484a2c1bb47da4287420d000000000000220020cab334e4d7aa7899d26d7e2830e493ba2c225635df1735b7ffa6c8ffa5b42cd400000000";

export const PATH_FROM_XPUB = "m/0/1";
export const PATH_FROM_MASTER_XPUB = "m/48'/1'/0'/2'/0/1";

export const GOOGLE_DRIVE = {
  client_id: "1062903223214-7e39qq3k4tes08k4pdeh9vk9rmr8umoo.apps.googleusercontent.com",
  project_id: "coldcard-kitchen",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_secret: "NLQ70g1KrOb5UANCGX4s-Guz",
  redirect_uris: [
    "urn:ietf:wg:oauth:2.0:oob",
    "http://localhost:3000/authorize"
  ]
};