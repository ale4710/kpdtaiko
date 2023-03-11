//https://github.com/amrayn/allsettled-polyfill

Promise.allSettled = Promise.allSettled || ((promises) => Promise.all(promises.map(p => p
  .then(value => ({
    status: 'fulfilled', value
  }))
  .catch(reason => ({
    status: 'rejected', reason
  }))
)));