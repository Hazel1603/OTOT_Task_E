import React from "react";
import logo from "./logo.svg";
import "./App.css";
import e from "cors";

function App() {
  const [data, setData] = React.useState(null);
  const [hitTimeTaken, setHitTimeTaken] = React.useState(0);
  const [missTimeTaken, setMissTimeTaken] = React.useState(0);
  const [cacheFlushed, setCacheFlushed] = React.useState(false);

  function getData() {
    const startDt = new Date()
    fetch("/todos")
      .then((res) => res.json())
      .then((data) => {
        setData(data.data)
        const endDt = new Date()
        const timeDiff = endDt - startDt
        if (data.cache === 'hit') {
          setHitTimeTaken(timeDiff)
        } else {
          setMissTimeTaken(timeDiff)
        }
      })
  }

  function flushCache() {
    fetch("/flush")
      .then((res) => res.json())
      .then((data) => {
        setCacheFlushed(true)
        setTimeout(()=> {
          setCacheFlushed(false)
        }, 2000)
      })
  }

  React.useEffect(() => {
    getData()
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <p>{'Cache Hit Time Taken: '}</p><p>{hitTimeTaken} ms</p>

        <p>{'Cache Miss Time Taken: '}</p><p>{missTimeTaken} ms</p>

        <button onClick={getData} style={{marginBottom: 10}}>Retrieve Data</button>

        <button onClick={flushCache} style={{marginBottom: 10}}>Flush Cache</button>

        {cacheFlushed && <p>Cache flushed!</p>}

        { (data != null && data.length > 0) &&
          <table border='1' style={{'borderCollapse': 'collapse'}}>
            <tbody>
              <tr>
                <th>Title</th>
                <th>Completed</th>
              </tr>
              {data.map((item) => {
                return (
                  <tr key={item['id']}>
                    <td>{item["title"]}</td>
                    <td>{item["completed"] ? 'Yes' : 'No'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        }
      </header>
    </div>
  );
}

export default App;