import { exec } from "child_process";

const runCommand = async (command) => {
  return new Promise((resolve, reject) => {
    exec(`../HWI/hwi.py ${command}`, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      }
      resolve(JSON.parse(stdout));
    });
  });
}

export default runCommand;