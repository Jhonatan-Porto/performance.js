const $globalCode = document.querySelector('#global')
const $runBtn = document.querySelector('.run')
const $bars = document.querySelectorAll('.bar')
const $percentages = document.querySelectorAll('.percentage')
const COLORS = ['green', 'yellow', 'orange', 'red']

const runTest = async ({ code, data }) => {
  const worker = new Worker('worker.js')
  worker.postMessage({code, data, duration: 1000})

  /* return new Promise(resolve => {
    worker.onmessage = event => {
      resolve(event.data)
    }
  }) */

  const { resolve, promise } = Promise.withResolvers()
  worker.onmessage = event => { resolve(event.data) }
  return promise
}

const runTestCases = async () => {
  const $testCases = document.querySelectorAll('.test-case')

  $bars.forEach(bar => bar.setAttribute('height', 0))
  $percentages.forEach(percentage => percentage.textContent = '0%')

  const globalCode = $globalCode.value


  const promises = Array.from($testCases).map(async (testCase, index) => {
    const $code = testCase.querySelector('.code')
    const $ops = testCase.querySelector('.ops')

    const codeValue  = $code.value
    $ops.textContent = 'Loading...'

    const result = await runTest({ code: codeValue, data: globalCode })

    $ops.textContent = `${result.toLocaleString()} ops/s`

    return result
  })


  const results = await Promise.all(promises)

  const maxOps = Math.max(...results)

  const sortedResults = results
  .map((result, index) => ({result, index}))
  .sort((a, b) => b.result - a.result)
  
  results.forEach((result, index) => {
    const bar = $bars[index]
    const percentage = $percentages[index]


    const indexColor = sortedResults.findIndex(x => x.index === index)
    const color = COLORS[indexColor]
    const height = result / maxOps * 300

    bar.setAttribute('height', height)
    bar.setAttribute('fill', color)
    
    const percentageValue = Math.round(result / maxOps * 100)
    percentage.textContent = `${percentageValue}%`
  })
  
}

runTestCases()


$runBtn.addEventListener('click', () => {
  runTestCases()
})