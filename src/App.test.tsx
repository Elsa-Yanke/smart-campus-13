// @vitest-environment jsdom
import { describe, it, expect, afterEach, beforeAll } from 'vitest';
import { render, screen, within, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import App from '@/App';

beforeAll(() => {
  // jsdom does not implement scrollIntoView; polyfill for tests only.
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => {};
  }
});

afterEach(() => {
  cleanup();
});

async function selectRoomByName(user: ReturnType<typeof userEvent.setup>, name: string) {
  const item = screen.getByRole('button', { name: new RegExp(name) });
  await user.click(item);
}

describe('App UI integration', () => {
  it('F4 — set Attendees to 100 shows "No rooms match" and disables Check button', async () => {
    render(<App />);
    const user = userEvent.setup();

    const attendeesInput = screen.getByLabelText('Attendees');
    await user.clear(attendeesInput);
    await user.type(attendeesInput, '100');

    expect(screen.getByText('No rooms match your requirements')).toBeVisible();

    const checkButtons = screen.getAllByRole('button', { name: /Check availability/ });
    expect(checkButtons.length).toBe(1);
    expect(checkButtons[0]).toBeDisabled();
  });

  it('F5 — select A101, check 660-720 -> Available, then select C301 -> Unavailable without clicking again', async () => {
    render(<App />);
    const user = userEvent.setup();

    await selectRoomByName(user, 'Seminar Room A101');

    const startInput = screen.getByLabelText('Start (minutes)');
    const endInput = screen.getByLabelText('End (minutes)');
    await user.clear(startInput);
    await user.type(startInput, '660');
    await user.clear(endInput);
    await user.type(endInput, '720');

    const checkButton = screen.getByRole('button', { name: /Check availability/ });
    await user.click(checkButton);

    const aside = screen.getByText('Existing bookings').closest('aside')!;
    expect(within(aside).getByText('Available')).toBeInTheDocument();

    await selectRoomByName(user, 'Video Studio C301');

    expect(await screen.findByText('Unavailable')).toBeInTheDocument();
  });
});
