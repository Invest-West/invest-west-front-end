import React from 'react';
import { resources } from '../Resources';

describe('Resources page', () => {
    it('resources array is empty', () => {
        expect(resources).toHaveLength(0);
    });
});
