# @lp-labs/react-stepper

Multi-step workflows with async validation gates and progress navigation. React 18+ peer only; ESM, CommonJS and TypeScript included.

## Installation

```sh
npm install @lp-labs/react-stepper
```

## Quick Start

```jsx
import { Stepper } from '@lp-labs/react-stepper';
export default function Example() {
  return (
    <Stepper
      steps={[
        {
          id: 'details',
          label: 'Details',
          content: <p>Review your details.</p>,
          validate: async () => true,
        },
        { id: 'confirm', label: 'Confirm', content: <p>Confirm the operation.</p> },
      ]}
      onComplete={() => console.log('Finished')}
    />
  );
}
```

## API

Steps contain unique id,label,content,optional disabled and validate({signal,from,to}):boolean|string|Promise<boolean|string>. False/string blocks forward progress and displays an error. Backward navigation does not validate. Props: steps, activeStep/defaultStep=0 (zero-based), onStepChange, onComplete, linear=true, label='Progress', className. Controlled activeStep requires onStepChange. Previous/Next/Finish controls are native buttons; completed steps can be revisited. Validation and completion run sequentially; duplicate transitions are blocked while pending. Cancel aborts the current transition signal.

## Benefits

| Area                | Details                                              |
| ------------------- | ---------------------------------------------------- |
| Validation gates    | Block forward navigation until an async step passes. |
| Cancel-aware        | Give pending validation an AbortSignal.              |
| Controlled progress | Synchronize active steps with application state.     |

## Customization

| Area       | Details                                                      |
| ---------- | ------------------------------------------------------------ |
| Step model | Provide IDs, labels, content, disabled state, and validator. |
| Workflow   | Choose linear navigation and controlled active step.         |
| Completion | Set step-change and final-completion callbacks.              |

## Security And Limits

At most100 steps. Gates are client-side workflow rules, not access control; authorize final submissions on the server and make destructive completion handlers idempotent. Async validators must honor the signal to cancel remote work. Application content owns form state and accessible field labels. No automatic form persistence, router synchronization or progress animation. Replacing the step list during pending remote work should be coordinated by the application.

## Support

[Donate via PayPal](https://www.paypal.me/LibinPrasanth). Author: [Libin Prasanth](https://www.linkedin.com/in/libinprasanth/).

## License

MIT License. See the packaged [LICENSE](LICENSE) file.
