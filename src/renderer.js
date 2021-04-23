const { ipcRenderer } = require('electron')
let folderPath = ''

const getFilePathFromEvent = (event) => {
  return event.dataTransfer.files[0].path;
}

document.addEventListener('drop', (event) => {
  folderPath = getFilePathFromEvent(event)
  const subFolders = ipcRenderer.sendSync('ondrop', folderPath)

  Object.values(form.children).map((node) => {
    if (!(node instanceof HTMLDivElement)) {
      node.remove();
    }
  })

  subFolders.map((folderName, index) => {
    var label = document.createElement('label');
    var input = document.createElement('input');

    const labelProps = {
      name: `label-${index}`,
      htmlFor: `checkbox-${index}`,
      innerText: folderName
    }

    const checkboxProps = {
      type: "checkbox",
      name: `checkbox-${index}`,
      value: folderName
    }

    labelWithProps = Object.assign(label, labelProps)
    checkboxWithProps = Object.assign(input, checkboxProps)

    form.appendChild(labelWithProps);
    form.appendChild(checkboxWithProps);
  });
})

const dialogButton = document.getElementById('dialog-btn')
dialogButton.addEventListener('click', (e) => {
  e.preventDefault()
  const response = ipcRenderer.sendSync('opendialog', null);
  destinationInput = document.getElementById('output-path')
  destinationInput.value = response;
})

const form = document.forms[0]
form.addEventListener("submit", (e) => {
  e.preventDefault();
  let payload = {
    outputPath: '',
    excludedFiles: [],
    folderPath
  };
  const formData = new FormData(e.target);
  for (const [key, value] of formData.entries()) {
    if (key === 'outputPath') {
      payload.outputPath = value
    } else {
      payload = {
        ...payload,
        excludedFiles: payload.excludedFiles.concat([value])
      }
    }
  }
  console.log(payload);
  ipcRenderer.sendSync('onsubmit', payload);
})

document.addEventListener('dragover', (e) => {
  e.preventDefault();
  e.stopPropagation();
})





