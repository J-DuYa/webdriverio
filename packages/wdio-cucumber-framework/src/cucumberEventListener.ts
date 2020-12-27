import { EventEmitter } from 'events'
import { messages } from '@cucumber/messages'
import logger from '@wdio/logger'

const log = logger('CucumberEventListener')

export default class CucumberEventListener extends EventEmitter {
    private _gherkinDocEvents: messages.IGherkinDocument[] = []
    private _scenarios: messages.IPickle[] = []
    private _testCases: messages.ITestCase[] = []
    private _currentTestCase?: messages.ITestCaseStarted
    private _currentStep?: messages.TestCase.ITestStep
    private _suiteMap: Map<string, string> = new Map()

    constructor (eventBroadcaster: EventEmitter) {
        super()
        eventBroadcaster.on('envelope', (envelope: messages.Envelope) => {
            if (envelope.gherkinDocument) {
                this.onGherkinDocument(envelope.gherkinDocument)
            } else if (envelope.testRunStarted) {
                this.onTestRunStarted()
            } else if (envelope.pickle) {
                this.onPickleAccepted(envelope.pickle)
            } else if (envelope.testCase) {
                this.onTestCasePrepared(envelope.testCase)
            } else if (envelope.testCaseStarted) {
                this.onTestCaseStarted(envelope.testCaseStarted)
            } else if (envelope.testStepStarted) {
                this.onTestStepStarted(envelope.testStepStarted)
            } else if (envelope.testStepFinished) {
                this.onTestStepFinished(envelope.testStepFinished)
            } else if (envelope.testCaseFinished) {
                this.onTestCaseFinished()
            } else if (envelope.testRunFinished) {
                this.onTestRunFinished()
            } else {
                log.debug(`Unknown envelope received: ${JSON.stringify(envelope, null, 4)}`)
            }
        })
    }

    // {
    //     "gherkinDocument": {
    //         "uri": "/Users/christianbromann/Sites/WebdriverIO/webdriverio/examples/wdio/cucumber/features/my-feature.feature",
    //         "feature": {
    //             "location": {
    //                 "line": 1,
    //                 "column": 1
    //             },
    //             "language": "en",
    //             "keyword": "Feature",
    //             "name": "Example feature",
    //             "description": "  As a user of WebdriverIO\n  I should be able to use different commands\n  to get informations about elements on the page",
    //             "children": [
    //                 {
    //                     "scenario": {
    //                         "location": {
    //                             "line": 6,
    //                             "column": 3
    //                         },
    //                         "keyword": "Scenario",
    //                         "name": "Get size of an element",
    //                         "steps": [
    //                             {
    //                                 "location": {
    //                                     "line": 7,
    //                                     "column": 5
    //                                 },
    //                                 "keyword": "Given ",
    //                                 "text": "I go on the website \"https://github.com/\"",
    //                                 "id": "0"
    //                             },
    //                             {
    //                                 "location": {
    //                                     "line": 8,
    //                                     "column": 5
    //                                 },
    //                                 "keyword": "Then ",
    //                                 "text": "should the element \".header-logged-out a\" be 32px wide and 35px high",
    //                                 "id": "1"
    //                             }
    //                         ],
    //                         "id": "2"
    //                     }
    //                 }
    //             ]
    //         }
    //     }
    // }
    onGherkinDocument (gherkinDocEvent: messages.IGherkinDocument) {
        this._gherkinDocEvents.push(gherkinDocEvent)
    }

    // {
    //     "pickle": {
    //         "id": "5",
    //         "uri": "/Users/christianbromann/Sites/WebdriverIO/webdriverio/examples/wdio/cucumber/features/my-feature.feature",
    //         "name": "Get size of an element",
    //         "language": "en",
    //         "steps": [
    //             {
    //                 "text": "I go on the website \"https://github.com/\"",
    //                 "id": "3",
    //                 "astNodeIds": [
    //                     "0"
    //                 ]
    //             },
    //             {
    //                 "text": "should the element \".header-logged-out a\" be 32px wide and 35px high",
    //                 "id": "4",
    //                 "astNodeIds": [
    //                     "1"
    //                 ]
    //             }
    //         ],
    //         "astNodeIds": [
    //             "2"
    //         ]
    //     }
    // }
    onPickleAccepted (pickleEvent: messages.IPickle) {
        const id = this._suiteMap.size.toString()
        this._suiteMap.set(pickleEvent.id as string, id)
        const scenario = { ...pickleEvent, id }

        this._scenarios.push(scenario)
    }

    // {
    //     "testRunStarted": {
    //         "timestamp": {
    //             "seconds": "1609002214",
    //             "nanos": 447000000
    //         }
    //     }
    // }
    onTestRunStarted () {
        const doc = this._gherkinDocEvents[this._gherkinDocEvents.length - 1]
        this.emit('before-feature', doc.uri, doc.feature)
    }

    // {
    //     "testCase": {
    //         "id": "15",
    //         "pickleId": "5",
    //         "testSteps": [
    //             {
    //                 "id": "16",
    //                 "hookId": "13"
    //             },
    //             {
    //                 "id": "17",
    //                 "pickleStepId": "3",
    //                 "stepDefinitionIds": [
    //                     "6"
    //                 ],
    //                 "stepMatchArgumentsLists": [
    //                     {
    //                         "stepMatchArguments": [
    //                             {
    //                                 "group": {
    //                                     "start": 21,
    //                                     "value": "https://github.com/"
    //                                 }
    //                             }
    //                         ]
    //                     }
    //                 ]
    //             },
    //             {
    //                 "id": "18",
    //                 "pickleStepId": "4",
    //                 "stepDefinitionIds": [
    //                     "8"
    //                 ],
    //                 "stepMatchArgumentsLists": [
    //                     {
    //                         "stepMatchArguments": [
    //                             {
    //                                 "group": {
    //                                     "start": 20,
    //                                     "value": ".header-logged-out a"
    //                                 }
    //                             },
    //                             {
    //                                 "parameterTypeName": "int",
    //                                 "group": {
    //                                     "start": 45,
    //                                     "value": "32"
    //                                 }
    //                             },
    //                             {
    //                                 "parameterTypeName": "int",
    //                                 "group": {
    //                                     "start": 59,
    //                                     "value": "35"
    //                                 }
    //                             }
    //                         ]
    //                     }
    //                 ]
    //             },
    //             {
    //                 "id": "19",
    //                 "hookId": "11"
    //             }
    //         ]
    //     }
    // }
    onTestCasePrepared (testCase: messages.ITestCase) {
        this._testCases.push(testCase)
    }

    // {
    //     "testCaseStarted": {
    //         "timestamp": {
    //             "seconds": "1609002214",
    //             "nanos": 453000000
    //         },
    //         "attempt": 0,
    //         "testCaseId": "15",
    //         "id": "20"
    //     }
    // }
    onTestCaseStarted (testcase: messages.ITestCaseStarted) {
        this._currentTestCase = testcase
        const tc = this._testCases.find(tc => tc.id === testcase.testCaseId)
        const scenario = this._scenarios.find(sc => sc.id === this._suiteMap.get(tc?.pickleId as string))

        if (!scenario) {
            return
        }

        const doc = this._gherkinDocEvents.find(gde => gde.uri === scenario?.uri)
        this.emit('before-scenario', scenario.uri, doc?.feature, scenario)
    }

    // {
    //     "testStepStarted": {
    //         "timestamp": {
    //             "seconds": "1609002214",
    //             "nanos": 454000000
    //         },
    //         "testStepId": "16",
    //         "testCaseStartedId": "20"
    //     }
    // }
    onTestStepStarted (testStepStartedEvent: messages.ITestStepStarted) {
        const { uri, feature } = this._gherkinDocEvents[this._gherkinDocEvents.length - 1]
        const testcase = this._testCases.find((testcase) => this._currentTestCase && testcase.id === this._currentTestCase.testCaseId)
        const scenario = this._scenarios.find(sc => sc.id === this._suiteMap.get(testcase?.pickleId as string))
        const teststep = testcase?.testSteps?.find((step) => step.id === testStepStartedEvent.testStepId)
        const step = scenario?.steps?.find((s) => s.id === teststep?.pickleStepId)

        if (!step) {
            return
        }

        this._currentStep = step
        this.emit('before-step', uri, feature, scenario, step)
    }

    // {
    //     "testStepFinished": {
    //         "testStepResult": {
    //             "status": "PASSED",
    //             "duration": {
    //                 "seconds": "0",
    //                 "nanos": 1000000
    //             }
    //         },
    //         "timestamp": {
    //             "seconds": "1609002214",
    //             "nanos": 455000000
    //         },
    //         "testStepId": "16",
    //         "testCaseStartedId": "20"
    //     }
    // }
    onTestStepFinished (testStepFinishedEvent: messages.ITestStepFinished) {
        const { uri, feature } = this._gherkinDocEvents[this._gherkinDocEvents.length - 1]
        const testcase = this._testCases.find((testcase) => testcase.id === this._currentTestCase?.testCaseId)
        const scenario = this._scenarios.find(sc => sc.id === this._suiteMap.get(testcase?.pickleId as string))
        const teststep = testcase?.testSteps?.find((step) => step.id === testStepFinishedEvent.testStepId)
        const step = scenario?.steps?.find((s) => s.id === teststep?.pickleStepId)
        const result = testStepFinishedEvent.testStepResult

        if (!step) {
            return
        }

        this.emit('after-step', uri, feature, scenario, step, result)
        delete this._currentStep
    }

    // {
    //     "testCaseFinished": {
    //         "timestamp": {
    //             "seconds": "1609002223",
    //             "nanos": 913000000
    //         },
    //         "testCaseStartedId": "20"
    //     }
    // }
    onTestCaseFinished () {
        const tc = this._testCases.find(tc => tc.id === this._currentTestCase?.testCaseId)
        const scenario = this._scenarios.find(sc => sc.id === this._suiteMap.get(tc?.pickleId as string))

        if (!scenario) {
            return
        }

        const doc = this._gherkinDocEvents.find(gde => gde.uri === scenario?.uri)
        this.emit('after-scenario', doc?.uri, doc?.feature, scenario)
        delete this._currentTestCase
    }

    // testRunFinishedEvent = {
    //     "timestamp": {
    //         "seconds": "1609000747",
    //         "nanos": 793000000
    //     }
    // }
    onTestRunFinished () {
        const gherkinDocEvent = this._gherkinDocEvents.pop() // see .push() in `handleBeforeFeature()`

        if (!gherkinDocEvent) {
            return
        }

        this.emit('after-feature', gherkinDocEvent.uri, gherkinDocEvent.feature)
    }

    getCurrentStep () {
        return this._currentStep
    }
}
