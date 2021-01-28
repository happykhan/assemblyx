// for a full working demo of Netlify Identity + Functions, see https://netlify-gotrue-in-react.netlify.com/

const fetch = require('node-fetch')

const handler = async function (event, context, callback) {
  try {
    const response = await fetch('http://rest.pubmlst.org/db/pubmlst_rmlst_seqdef_kiosk/schemes/1/sequence', JSON.stringify(event.payload))


  } catch (error) {
    // output to netlify function log
    console.log(error)
    return {
      statusCode: 500,
      // Could be a custom message or object i.e. JSON.stringify(err)
      body: JSON.stringify({ msg: error.message }),
    }
  }
  callback(null, {
    statusCode: 200,
    body: JSON.stringify({
      result: response
    })
  });  
}

module.exports = { handler }
