import { describe, expect, it } from 'vitest'
import { sanitizeNodeId, quoteColumn, escapeRString } from './utils'

describe('sanitizeNodeId', () => {
    it('replaces hyphens with underscores', () => {
        expect(sanitizeNodeId('abc-def-123')).toBe('abc_def_123')
    })

    it('replaces dots with underscores', () => {
        expect(sanitizeNodeId('node.1.2')).toBe('node_1_2')
    })

    it('leaves alphanumeric characters unchanged', () => {
        expect(sanitizeNodeId('abc123')).toBe('abc123')
    })

    it('replaces multiple special characters', () => {
        expect(sanitizeNodeId('a-b.c@d!e')).toBe('a_b_c_d_e')
    })

    it('handles empty string', () => {
        expect(sanitizeNodeId('')).toBe('')
    })
})

describe('quoteColumn', () => {
    it('wraps simple names in backticks', () => {
        expect(quoteColumn('age')).toBe('`age`')
    })

    it('wraps names with spaces in backticks', () => {
        expect(quoteColumn('first name')).toBe('`first name`')
    })

    it('wraps names with special characters in backticks', () => {
        expect(quoteColumn('income ($)')).toBe('`income ($)`')
    })
})

describe('escapeRString', () => {
    it('escapes backslashes', () => {
        expect(escapeRString('a\\b')).toBe('a\\\\b')
    })

    it('escapes double quotes', () => {
        expect(escapeRString('say "hello"')).toBe('say \\"hello\\"')
    })

    it('escapes both backslashes and quotes', () => {
        expect(escapeRString('path\\to\\"file"')).toBe('path\\\\to\\\\\\"file\\"')
    })

    it('returns unchanged string when no escaping needed', () => {
        expect(escapeRString('hello world')).toBe('hello world')
    })
})
