import { render, screen, fireEvent } from '@testing-library/react'
import { StartScreen } from '../StartScreen'
import { describe, it, expect, vi } from 'vitest'

describe('StartScreen', () => {
  it('renders correctly', () => {
    const onUseCamera = vi.fn()
    const onUpload = vi.fn()
    render(<StartScreen onUseCamera={onUseCamera} onUpload={onUpload} />)

    expect(screen.getByAltText('Photobooth Logo')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: "˙✧˖°📸⋆｡ ˚" })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: "˙✧˖°📂 ⋆｡˚" })).toBeInTheDocument()
  })

  it('calls correct handlers when buttons are clicked', () => {
    const onUseCamera = vi.fn()
    const onUpload = vi.fn()
    render(<StartScreen onUseCamera={onUseCamera} onUpload={onUpload} />)

    fireEvent.click(screen.getByRole('button', { name: "˙✧˖°📸⋆｡ ˚" }))
    expect(onUseCamera).toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: "˙✧˖°📂 ⋆｡˚" }))
    expect(onUpload).toHaveBeenCalled()
  })
})
