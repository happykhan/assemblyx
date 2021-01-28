
  function checkRMLST(record) {
    if (!("rmlst" in record) & ("seq" in record)) {
      const encodeSeq = new Buffer.from(record['seq']).toString('base64');
      const payload = { base64: true, details: true, sequence: encodeSeq }
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload) 
      }; 
      console.log(payload)
      fetch('https://cors-anywhere.herokuapp.com/http://rest.pubmlst.org/db/pubmlst_rmlst_seqdef_kiosk/schemes/1/sequence', requestOptions)
      .then(response => response.json())
      .then(data => console.log(data)); 
    }
  }