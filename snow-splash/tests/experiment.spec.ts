import { makeRoot } from "../src/library.new-root-container"
function printTokenValue(token, value) {
  console.log(`Token: ${token}  | ${value}  -- of ${typeof value}`)
}
describe.only("Node.get()", () => {
  let root: ReturnType<typeof makeRoot>

  beforeEach(() => {
    root = makeRoot()
  })

  it("should return a value as a value", async () => {
    const node = root.addNode({
      a: 123,
    })
    expect(node.get("a")).toBe(123)
  })
  it("should return function result and not a function", async () => {
    const node = root.addNode({
      functionTOken: () => "optimus",
    })
    expect(node.get("functionTOken")).toBe("optimus")
  })
  it("should return correct tokens for merged and overriden nodes", () => {
    const node = root
      .addNode({
        optimus: () => "prime",
        a: 123,
      })
      .addNode({
        a: "123",
      })
    expect(node.getTokens()).toMatchObject({
      optimus: "optimus",
      a: "a",
    })
  })

  it("should return cached value of a function", async () => {
    let fn = jest.fn()
    const node = root.addNode({
      optimus: () => {
        fn()
        return "prime"
      },
    })
    node.get("optimus")
    node.get("optimus")
    expect(node.get("optimus")).toBe("prime")
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it("should return promises of async functions", (cb) => {
    ;(async () => {
      const node = root.addNode({
        optimus: async () => "prime",
      })
      expect(await node.get("optimus")).toBe("prime")
      cb()
    })()
  })

  it("should call container provider once, but container token twice", () => {
    const fn1 = jest.fn()
    const fn2 = jest.fn()

    const node = root.addNode({
      autobots: () => {
        fn1()
        return {
          optimus: () => {
            fn2()
            return "autobots assemble"
          },
          bumblebee: "bumblebee",
          jazz: "jazz",
        }
      },
    })
    expect(fn1).not.toBeCalled()
    expect(fn2).not.toBeCalled()

    let a1 = node.get("autobots")
    a1.optimus()
    let a2 = node.get("autobots")
    a2.optimus()
    expect(fn1).toHaveBeenCalledTimes(1)
    expect(fn2).toHaveBeenCalledTimes(2)
  })
})
