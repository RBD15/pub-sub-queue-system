const { randomTimeStampDate, isValidTimestamp } = require("../../../../src/Shared/Utils/date")

describe('Date utils file',()=>{

    test('Valid timestamp',()=>{
        let timestamp
        let result

        timestamp = randomTimeStampDate()
        result = isValidTimestamp(timestamp)
        expect(result).toBe(true)

        timestamp = "2025-09-14T11:38:00"
        result = isValidTimestamp(timestamp)
        expect(result).toBe(true)

        timestamp = "14 Sep 2025 11:38"
        result = isValidTimestamp(timestamp)
        expect(result).toBe(true)

        timestamp = "not a date"
        result = isValidTimestamp(timestamp)
        expect(result).toBe(false)

        timestamp = "2025-09-15T02:50:40.505Z"
        result = isValidTimestamp(timestamp)
        expect(result).toBe(true)
    })

    test('random date',()=>{
        const timestamp = randomTimeStampDate()
        result = isValidTimestamp(timestamp)
        expect(result).toBe(true)
    })

})