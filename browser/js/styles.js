const styles = {
  main: {
   fontFamily: 'helvetica, sans-serif',
   maxWidth: '40em',
   width: '98%',
   margin: '0 auto'
  },

  input: {
    fontSize: '2em',
    border: 'none',
    margin: '10% auto'
  },

  button: {
    display: 'block',
    margin: '0',
    fontSize: '1.35em',
    background: 'none',
    border: '2px solid #444',
    color: '#444',
    padding: '.75em 2em',
    letterSpacing: '1px',
    cursor: 'pointer'
  },

  row: {
    display: 'flex'
  },

  name: {
    flex: '1',
    fontWeight: 'bold',
    color: '#333'
  },

  clicks: {
    flex: '3',
    color: 'rgba(0, 0, 0, 0.8)'
  }
}

module.exports = styles
