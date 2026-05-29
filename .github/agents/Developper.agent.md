---
name: Developpeur
description: This custom agent implements features based on a provided plan.
model: gpt-5 mini
handoffs:
  - label: Review
    agent: Reviewer
    prompt: 'Review the implementation and provide feedback'
    send: true
  - label: Tester
    agent: Testeur
    prompt: 'Verify the implementation by running the tests.'
    send: true
---