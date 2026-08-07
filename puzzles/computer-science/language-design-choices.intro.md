# Languages as design commitments

A programming language is more than a list of keywords. It packages choices about how programs are checked, how they become running behavior, and how memory is kept safe enough to use.

Those choices trade off against one another. Catching mistakes early can cost annotation or compile time. Deferring checks until a program runs can make small scripts feel immediate, while shifting failures onto particular paths. Managing memory automatically can free attention for the problem at hand; managing it more explicitly can make costs and lifetimes clearer.

## Three axes to watch

As you organize the board, ask of each idea which axis it mainly belongs to:

- **Types** — When is type information known, and who is responsible for getting it right?
- **Execution** — How does source become something a machine can carry out?
- **Memory** — Who decides when storage can be reclaimed, and on what evidence?

After the map is solved, later rounds will ask you to reassemble those same ideas into familiar language profiles. The point is not that every implementation of a named language is identical, but that recognizable combinations of commitments keep showing up.

> **Reflection:** When you reach for a language you already know, which of these three commitments do you notice first—and which do you usually take for granted?
