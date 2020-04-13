import runCommand from './runCommand';

export const enumerate = async () => {
  return await runCommand('enumerate');
}

export const getMasterXPub = async (deviceType, devicePath) => {
  return await runCommand(`-t ${deviceType} -d "${devicePath}" getmasterxpub`)
}

export const getXPub = async (deviceType, devicePath, path) => {
  return await runCommand(`-t ${deviceType} -d "${devicePath}" getxpub "${path}"`)
}

export const signtx = async (deviceType, devicePath, psbt) => {
  return await runCommand(`-t ${deviceType} -d "${devicePath}" signtx "${psbt}"`)
}

export const displayaddress = async (deviceType, devicePath, path) => {
  return await runCommand(`-t ${deviceType} -d "${devicePath}" getxpub "${path}"`)
}