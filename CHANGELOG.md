# esformatter changelog

## v0.1.0 (2014-04-15)

 - major refactor on the code structure and major changes to the default tool
   behavior.
 - changed some rules so the tool is less opinionated.
 - change formatter logic to support ranges on the configuration file.
 - avoid removing line breaks during the formatting process, increasing the
   flexibility of the formatting rules.


## notes about v0.0.1 (2012-12-06) till v0.0.16 (2014-02-24)

The formatter had stricter rules and was way less flexible before v0.1.0;

Lots of small improvements between each version. Behavior was still in flux and
each version was breaking backwards compatibility.

We considered v0.0.15 (2013-12-18) to be "stable" for most common cases, most
of bugs found in the following months after release was on edge-cases. We
decided to make a big refactor to increase the formatter flexibility and to be
less aggressive on the changes.


