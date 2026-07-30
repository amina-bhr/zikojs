// import { __init__global__ } from "../__ziko__/index.js";

// if (!globalThis.__Ziko__) __init__global__();

export function useState(initialValue) {
    
    const state = {
        value: initialValue,
        subscribers: new Set(),
        paused: false,
    };

    function getValue() {
        return {
            value: state.value,
            isStateGetter: () => true,
            _subscribe: (fn) => {
                state.subscribers.add(fn);
                return () => state.subscribers.delete(fn);
            },
        };
    }

    function setValue(newValue) {
        if (state.paused) return;

        if (typeof newValue === "function") {
            newValue = newValue(state.value);
        }

        if (!Object.is(newValue, state.value)) {
            state.value = newValue;
            state.subscribers.forEach((fn) => fn(state.value));
        }
    }

    const controller = {
        pause: () => { state.paused = true; },
        resume: () => { state.paused = false; },
        clear: () => { state.subscribers.clear(); },
        force: (newValue) => {
            if (typeof newValue === "function") {
                newValue = newValue(state.value);
            }
            state.value = newValue;
            state.subscribers.forEach((fn) => fn(state.value));
        },
        getSubscribers: () => new Set(state.subscribers),
    };

    return [getValue, setValue, controller];
}

export const isStateGetter = (arg) => {
    return typeof arg === "function" && arg?.()?.isStateGetter?.() === true;
};