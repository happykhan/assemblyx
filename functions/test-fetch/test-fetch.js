// Docs on event and context https://www.netlify.com/docs/functions/#the-handler-method
const fetch = require('node-fetch')

const handler = async (event, context) => {
  return new Promise((resolve, reject) => {
    const payload = JSON.parse(event.body)
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload) 
    };      
    console.log('Sending request to RMLST')
    fetch('https://jobrunnerx.herokuapp.com/api/v1/rmlst', requestOptions)
    .then(res => {
      if (res.ok) { // res.status >= 200 && res.status < 300
        return res.json();
      } else {
        resolve({ statusCode: res.status || 500, body: res.statusText })
      };
    })
    .then(data =>{
      const response = {
        statusCode: 200,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(data)
      }
      resolve(response);
    })
    .catch(err => {
      console.log(err)
      resolve({ statusCode: err.statusCode || 500, body: err.message })
    })
  })
}

module.exports = { handler }




  // const fetch = require('node-fetch')
  // text = {message: `Hello World`}
  // fetch('https://rest.pubmlst.org/db/pubmlst_neisseria_isolates', { headers: { 'Content-Type': 'application/json' } })
  // .then(result => {
  //   callback(null,
  //     { statusCode: 200,  headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(result.text) 
  //   }); 

  // })
  // .catch(err => { 
  //   callback(err);
  // });
  // };
   


 /* return {statusCode: 200, body: JSON.stringify(text) }*/
/*   try {
    fetch('https://rest.pubmlst.org/db/pubmlst_neisseria_isolates')
    .then(x => x.json())
    .then(z => {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: `Hello ${z}` }),
        // // more keys you can return:
        // headers: { "headerName": "headerValue", ... },
        // isBase64Encoded: true,
      }
    
    })
  } catch (error) {
    return { statusCode: 500, body: error.toString() }
  } */
//}

