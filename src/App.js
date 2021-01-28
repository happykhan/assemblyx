
import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import Summary from './Summary'
import Alert from 'react-bootstrap/Alert';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
/* 
const newMessage = (message, status) => {

  const newMess = <Row><Alert variant={status} >{message}</Alert></Row>
  return newMess
} */

function App(){  

  let messages = []
  const [dat, setDat] = useState( [] );
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

  const  addFastaFile = (file) => {
    const name = file.name
    const reader = new FileReader();
    reader.onload = async (e) => { 
      const text = (e.target.result)
      const savedMetrics = localStorage.getItem(`fasta-${name}`);
      // if (savedMetrics){
      //   setDat(dat.concat(JSON.parse(savedMetrics)));
      //   return
      // }

      let metrics = updateMetrics(name, text);
      metrics['name'] = name; 
      metrics['seq'] = text; 
      metrics['rank'] = 'unknown';
      metrics['taxon'] = 'unknown';
      const encodeSeq = new Buffer.from(text).toString('base64');
      const payload = { base64: true, details: true, sequence: encodeSeq }
      const requestOptions = {
        method: 'POST',
        // headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload) 
      }; 
      setDat(dat.concat(metrics));
      /*
      fetch('/db/pubmlst_rmlst_seqdef_kiosk/schemes/1/sequence', requestOptions) */
      fetch("https://boring-kepler-ad998d.netlify.app/.netlify/functions/rmlst-fetch", requestOptions)
      .then(response => response.json())
      .then(data => {
        metrics['taxon_prediction'] = data['taxon_prediction'];
        metrics['exact_matches'] = data['exact_matches'];
        metrics['taxon'] = data['taxon_prediction'][0]['taxon'];
        metrics['rank'] = data['taxon_prediction'][0]['rank'];
        localStorage.setItem(`fasta-${name}`, JSON.stringify(metrics))
      });  
      setDat( dat.concat(metrics));
      localStorage.setItem(`fasta-${name}`, JSON.stringify(metrics))
    };
    reader.readAsText(file);
  };

  const addFastaFiles = (files) => {
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
  ]; 

 return (
  <div className="App">  
  <Container>
    <Row>
    <h1>AssemblyX</h1>
    </Row>
    <Row>
      <Form>
      <Form.File  onChange={(e) => addFastaFiles(e)} multiple label="Select FASTA files"/>
      </Form>
    </Row>
    <Row>
    {(dat.length > 0)
    ? <Summary columns={columns} data={dat} />
    : <Alert variant='info'>Select some data to get started</Alert>
    }     
    </Row>
    <Row>
      <Col>
      Assembly charts will go here. 
      </Col>

      <Col>
      Species identification will go here. 
      </Col>
    </Row>
    { messages }

  </Container>

  </div>
  
); 
  
}
  
export default App;
  