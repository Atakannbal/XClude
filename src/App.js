import React, { useState, useEffect } from 'react'
const { ipcRenderer } = require('electron')

const getFilePathFromEvent = (event) => {
  return event.dataTransfer.files[0].path;
}

const getSubFolders = (folder) => {
  return ipcRenderer.sendSync('ondrop', folder)
}

const openFolderPickerDialog = () => {
  return ipcRenderer.sendSync('opendialog', null)
}

const filterExcludedFolders = (folders) => {
  return Object.keys(folders).filter((key) => folders[key] === true)
};

const initialStateForExcludedFolders = (array) => {
  return array.reduce((acc, curr) => {
    return {
      ...acc,
      [curr]: false
    }
  }, {})
}

export default function App() {
  const [outputDir, setOutputDir] = useState(null)
  const [droppedFolderPath, setDroppedFolderPath] = useState(null)
  const [subFolders, setSubFolders] = useState(null)
  const [excludedFolders, setExcludedFolders] = useState({})

  useEffect(() => {
    document.addEventListener('drop', (e) => {
      const path = getFilePathFromEvent(e)
      setDroppedFolderPath(path);
    })

    document.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
    })
  }, [])

  useEffect(() => {
    if (droppedFolderPath) {
      const folders = getSubFolders(droppedFolderPath)
      setSubFolders(folders);
    }
  }, [droppedFolderPath])

  // On folder drop, creates initial state object for excluded folders key value pairs are folderName - false
  useEffect(() => {
    if (subFolders) {
      const initialState = initialStateForExcludedFolders(subFolders)
      setExcludedFolders(initialState)
    }
  }, [subFolders]);

  const handleFolderPicker = () => {
    const selectedFolder = openFolderPickerDialog()
    setOutputDir(selectedFolder)
  }

  const handleSubmit = () => {
    const files = filterExcludedFolders(excludedFolders)
    ipcRenderer.sendSync('onsubmit', (event, {
      outputPath: outputDir,
      excludedFiles: files,
      folderPath: droppedFolderPath
    }))
  }

  const handleChange = (e) => {
    const { name } = e.target
    setExcludedFolders({
      ...excludedFolders,
      [name]: e.target.checked
    })
  }

  if (!droppedFolderPath) {
    return <h1>Drag & Drop a folder</h1>
  }

  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      flexDirection: 'column'
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <h3>Output directiory: </h3>
        <p style={{ marginLeft: '10px' }}> {outputDir} </p>
      </div>

      <button onClick={handleFolderPicker}>
        {outputDir ? 'Change Directory' : 'Choose Directory'}
      </button>

      <h3> Pick folders to exclude </h3>
      <div>
        {subFolders && subFolders.map((folder, index) => (
          <form>
            <input
              type='checkbox'
              name={folder}
              onChange={(e) => handleChange(e)}
              value={folder}
              key={index} />
            <label htmlFor={`folderName-${index}`}> {folder} </label>
          </form>
        ))}
      </div>
      <button style={{
        padding: '10px',
        width: '200px',
        margin: '30px auto'
      }}
        onClick={handleSubmit}>Archive</button>

    </div>
  )
}
