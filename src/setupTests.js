// Jest DOM extensions for custom matchers
import '@testing-library/jest-dom';

// Configure Aphrodite for testing - must be done before any component imports
import {StyleSheetTestUtils} from 'aphrodite';

beforeAll(() => {
    StyleSheetTestUtils.suppressStyleInjection();
});

afterAll(() => {
    StyleSheetTestUtils.clearBufferAndResumeStyleInjection();
});

// Mock Firebase
jest.mock('./firebase/firebaseApp', () => ({
    default: {
        auth: jest.fn(() => ({
            currentUser: null,
            onAuthStateChanged: jest.fn(),
            signInWithEmailAndPassword: jest.fn(),
            signOut: jest.fn()
        })),
        database: jest.fn(() => ({
            ref: jest.fn(() => ({
                once: jest.fn(),
                on: jest.fn(),
                off: jest.fn(),
                set: jest.fn(),
                update: jest.fn(),
                remove: jest.fn()
            }))
        })),
        storage: jest.fn(() => ({
            ref: jest.fn(() => ({
                put: jest.fn(),
                getDownloadURL: jest.fn()
            }))
        }))
    },
    DB: {
        ref: jest.fn(() => ({
            once: jest.fn(),
            on: jest.fn(),
            off: jest.fn()
        }))
    }
}));

// Mock Material-UI date pickers
jest.mock('@material-ui/pickers', () => ({
    MuiPickersUtilsProvider: ({ children }) => children,
    KeyboardDatePicker: () => null,
    DatePicker: () => null
}));

// Mock window.matchMedia for responsive components
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn()
    }))
});

// Mock window.scrollTo
window.scrollTo = jest.fn();

// Silence console errors and warnings during tests (optional - uncomment if needed)
// const originalError = console.error;
// const originalWarn = console.warn;
// beforeAll(() => {
//     console.error = (...args) => {
//         if (args[0]?.includes?.('Warning:')) return;
//         originalError.call(console, ...args);
//     };
//     console.warn = (...args) => {
//         if (args[0]?.includes?.('Warning:')) return;
//         originalWarn.call(console, ...args);
//     };
// });
// afterAll(() => {
//     console.error = originalError;
//     console.warn = originalWarn;
// });
