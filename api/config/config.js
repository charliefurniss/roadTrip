// configure JSON web token and mongo database
module.exports = {
  'secret': 'jsonwebtokensaregreat',
  'database': process.env.MONGOLAB_URI || 'mongodb://localhost:27017/roadtrip'
};