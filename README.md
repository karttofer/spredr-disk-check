# spredr-lab-chain

A production test for spredr: one push deploys three services at once (a plain web service and two agents), and the
writer agent hands two parts of each article to the helper agent at once (`ctx.delegate`, @spredr/sdk 0.2). No model
calls, no secrets. Safe to delete once the test is done.
