import {run} from './runner';
import {emptyEnv} from './compiler';

function webStart() {
  document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("run").addEventListener("click", function(e) {
      var importObject = {
        imports: {
          imported_func: (arg : any) => {
            console.log("Logging from WASM: ", arg);
            const elt = document.createElement("pre");
            document.getElementById("output").appendChild(elt);
            elt.innerText = arg;
          }
        }
      };
      const env = emptyEnv;

      const source = document.getElementById("user-code") as HTMLTextAreaElement;
      run(source.value, { importObject, env }).then(() => console.log ("run finished")).catch((e) => console.log("run failed", e));
    });
  });
}

webStart();
