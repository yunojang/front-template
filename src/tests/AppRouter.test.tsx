import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { AppRouter } from '../app/AppRouter'
import { AppProviders } from '../app/providers/AppProviders'

describe('AppRouter', () => {
  it('renders home page hero copy', async () => {
    render(
      <AppProviders>
        <AppRouter />
      </AppProviders>,
    )

    expect(await screen.findByText(/더빙 파이프라인을 누구나/i)).toBeInTheDocument()
  })
})
