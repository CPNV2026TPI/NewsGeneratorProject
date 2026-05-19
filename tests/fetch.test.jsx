//
//  Author: Fabian Rostello
//  Date: 19.05.2026
//  File: fetch.text.jsx
//  Description: Frontend test class for fetch feature
//

import '@testing-library/jest-dom';
import { it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {MemoryRouter} from "react-router-dom";
import {FetchPage} from "@/pages/Search.jsx";


it('display the fetch button', () => {
    render(
        <MemoryRouter>
            <FetchPage />
        </MemoryRouter>
    );

    const button = screen.getByRole('button', {name: /Fetch SearchApi/i });

    expect(button).toBeInTheDocument();
});