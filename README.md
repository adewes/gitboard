#Welcome to Gitboard!

Gitboard is an intuitive Kanban board for your Github issues. It runs securely in your browser
and does not need an intermediate server. It is built using React.js, Bootstrap + Material Design,
SASS and Require.js.

[Go to Live Version](https://adewes.github.io/gitboard)

##License

Gitboard is released under a *Affero General Public License (AGPL)*.

##Building Gitboard

To build the source locally, just check out the repository, go to the main directory and run make:

```bash
make
```

To perform optimizations for the production version, simply pass the `ENVIRONMENT` variable to make:

```bash
ENVIRONMENT=production make
```

##Development Requirements

You should have working versions of `npm`, `make`, `sass` and `bower` on your computer.

## How to contribute

Contributions are very welcome, and they are greatly appreciated! Every little bit helps, and credit will always be given.

## Reporting Bugs

If you experience problems using Gitboard or building it locally, please open an issue. 

When reporting a bug, please include the following information (if applicable):

* The trackeback of the error
* Your operating system name and version
* Any details about your local setup that might be helpful in troubleshooting
* Detailed steps to reproduce the bug
* A screenshots (if useful)
