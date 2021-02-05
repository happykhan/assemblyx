
import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import Summary from './Summary'
import Alert from 'react-bootstrap/Alert';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';

/* 
const newMessage = (message, status) => {

  const newMess = <Row><Alert variant={status} >{message}</Alert></Row>
  return newMess
} */

function App(){  
  const INIT_STATE = { records : []}  ; 
  let messages = [] 
  const [dat, setDat] = useState( INIT_STATE );
  // Check if any sequence needs to be done, then send. 
  const updateMetrics = (name, text) => {
    let outdict = {
      noContigs: 0,
      n50: 0, 
      name: name,
      totalBases: 0,
      contigs: [],
    };
    let contigLen = 0;    
    let first = true;

    for (const line of text.split("\n")) {
      if (line.startsWith('>') === true){
        outdict['noContigs'] += 1 ;
        if (!(first)) {
          outdict['contigs'].push(contigLen)
          contigLen = 0;
        }
        first = false;
        
      }else{
        outdict['totalBases'] += line.length
        contigLen += line.length
      }

    }
    outdict['contigs'].push(contigLen)
    outdict['contigs'].sort(function(a, b){return b-a});
    const n2 = ( outdict['totalBases'] / 2);
    let ind = 0; 
    let cumsum = 0;
    while (cumsum < n2) { 
      cumsum += outdict['contigs'][ind]
      ind +=1
    }
    outdict['n50'] = outdict['contigs'][ind];
    return outdict

  };
  const updateMainState = (state, row) => {
    let foundIndex = -1; 
    let count = 0 
    for (const element of state) {
      if (element['name'] === row['name']) {
        foundIndex = count
      }
      count++;
    }  
    if (foundIndex > -1){
      const newRows = [...state];
      newRows[foundIndex] = row; 
      return newRows;
    } else {
      return [...state, row];
    }

  }

  const  addFastaFile = (file) => {
    const name = file.name;
    const reader = new FileReader();
    reader.onload = async (e) => { 
      const text = (e.target.result)

      let metrics = updateMetrics(name, text);
      metrics['name'] = name; 
      metrics['seq'] = text; 
      metrics['rank'] = 'unknown';
      metrics['taxon'] = 'unknown';
      metrics['status'] = 'Fetching taxon';
      const encodeSeq = new Buffer.from(text).toString('base64');
      const payload = { base64: true, details: true, sequence: encodeSeq }
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload) 
      }; 

      setDat(dat => { return {records: updateMainState(dat.records, metrics)} } );

      fetch("https://boring-kepler-ad998d.netlify.app/.netlify/functions/test-fetch", requestOptions)
      .then(response => response.json())
      .then(data => {
        metrics['taxon_prediction'] = data['taxon_prediction'];
        metrics['exact_matches'] = data['exact_matches'];
        metrics['taxon'] = data['taxon_prediction'][0]['taxon'];
        metrics['rank'] = data['taxon_prediction'][0]['rank'];
        metrics['status'] = 'Done';
        setDat(dat => { return {records: updateMainState(dat.records, metrics)} } );
      })
      .catch(err => {
        console.log('ERROR: fetching taxon, ' + err)
        metrics['status'] = 'ERROR';
        setDat(dat => { return {records: updateMainState(dat.records, metrics)} } );
      });   
    };
    reader.readAsText(file);
  };
  const clearSession = () => {
    setDat( INIT_STATE );
  }
  var blob = new Blob([JSON.stringify(dat,null,2)], {type: "application/json"});
  const saveSession = URL.createObjectURL(blob);

  const loadSession = (file) => {
    const reader = new FileReader();
    reader.onload = async (e) => { 
      setDat(JSON.parse(e.target.result));
    }
    reader.readAsText(file.target.files[0]);

  }
  const addFastaFiles = (files) => {
    console.log(files.target);
    for (var i = 0; i < files.target.files.length; i++) {
      addFastaFile(files.target.files[i]);
    } 
    
  };
  
  const columns = [ 
      {
      Header: "Filename", accessor: "name",
      },
      {
      Header: "N50", accessor: "n50",
      },
      {
      Header: "Number of contigs", accessor: "noContigs",
      },
      {
        Header: "Total assembled bases", accessor: "totalBases",
        },
      {
        Header: "Rank", accessor: "rank",
        },      
        {
          Header: "Taxon", accessor: "taxon",
          },              
          {
            Header: "Status", accessor: "status",
            },                      
  ]; 
  
 return (
  <div className="App">  
  <Container>
    <Row>
    <h1>AssemblyX</h1>
    </Row>
    <Row>
      <Col>
        <Form>
        <Form.File  onChange={(e) => addFastaFiles(e) } multiple label="Select FASTA files"/>
        </Form>
      </Col>
      <Col>
        <Form>
        <Form.File  onChange={(e) => loadSession(e) } label="Load Session"/>
        </Form>     
      </Col>
    </Row> 
    <Row>
    {(dat.records.length > 0)
    ? <Summary columns={columns} data={dat.records} />
    : <Alert variant='info'>Load a FASTA file or AssemblyX.json file to get started</Alert>
    }     
    </Row>
    <Row>
      <Button href={saveSession} download>Save session</Button>
      <Button onClick={() => clearSession()}>Clear session</Button>
    </Row>    

    { messages }

  </Container>

  </div>
  
); 
  
}
  
export default App;
  