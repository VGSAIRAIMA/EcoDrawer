import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { calculateScanPoints, isModuleUnlocked, nextLevel, passedLevel } from './progression.ts'

describe('learning and game progression', () => {
  it('unlocks modules sequentially', () => {
    assert.equal(isModuleUnlocked(0, []), true)
    assert.equal(isModuleUnlocked(1, [false]), false)
    assert.equal(isModuleUnlocked(1, [true]), true)
  })

  it('uses the 60 percent game pass mark', () => {
    assert.equal(passedLevel(3, 5), true)
    assert.equal(passedLevel(2, 5), false)
    assert.equal(passedLevel(0, 0), false)
  })

  it('caps game progression at ten levels', () => {
    assert.equal(nextLevel(0), 1)
    assert.equal(nextLevel(10), 10)
  })

  it('caps scored scans at five per day', () => {
    assert.equal(calculateScanPoints(true, 0), 25)
    assert.equal(calculateScanPoints(false, 4), 15)
    assert.equal(calculateScanPoints(true, 5), 0)
  })
})
