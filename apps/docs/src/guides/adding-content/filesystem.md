# Adding from Filesystem

Adding content from your filesystem.

## Importing a series

1. Go to the `Add Series` page.
2. Select `filesystem` from the dropdown and click `Select Directory`. Optionally select
"Multi-series mode", which can be used for a directory with multiple series.
3. Edit the series details (title, description, etc.) from the popup dialog, and click
`Add series` to add it to your library.

You can view the series you added on the `Library` page. Edit series details by clicking `Edit` on
the series page.

## FAQ

- Can I use `zip`/`rar`/`cbr`/`cbz` chapters?
  - Yes, Houdoku supports importing directories that contain an archive file for each chapter.
  Archives should contain only images and should be named in the same way as a chapter directory.
- Does Houdoku make a copy of what I import?
  - No, Houdoku simply saves the location of the directory you provide and reads from it when
  necessary. If you move the series on your filesystem, you will need to remove/re-add it in Houdoku.
  - While reading from an archive file, Houdoku will extract images to a temporary location which
  is cleared occasionally.
- Can I update a series on the filesystem after I import it?
  - Yes, as long as the path to the directory you provided on import remains the same, you can edit
  it as much as you like (add/remove pages, rename chapters, etc.). These are updated when you
  refresh the series just like they would be for an external series.

## Example directory structure

```
Manga Title
  - [Group] Manga Title v1
    - [Group] Chapter One Title v1 c1
      - 1.jpg
      - 2.jpg
      - [...]
    - [Group] Chapter Two Title v1 c2
    - [Group] Chapter Three Title v1 c3.5
  - [Group] Manga Title v2
    - [Group] Chapter Four Title v2 c4
    - [Group] Chapter Five Title v2 c5
```

```
Manga Title
  - v1 c1 Chapter One Title [Group]
    - 1.jpg
    - 2.jpg
    - [...]
  - v1 c2 [Group]
  - v1 c3.5 Chapter Three Title [Group]
  - v2 c4 Chapter Four Title [Group]
  - [Group] Chapter One Title v2 c5
```

## Technical information

Houdoku treats every directory containing an image as a chapter. Therefore, it is
*functional* for any directory layout. The main concern is how metadata for chapters is parsed.

Things to keep in mind:
- Some releases separate a series only by volume. However, Houdoku will always list base directories as chapters.
- Currently, Houdoku only looks at base-level directory names. If you want metadata to be parsed,
it needs to be included in the name of each of those directories.

Houdoku extracts the following from those directory names:

- It attempts to find a chapter number in the form `cXX`. This can have a decimal; e.g. `c201.4`. If a
chapter number is not found, it attempts to find any number (separated by spaces). Finally, it
defaults to the previous chapter number + 1 (rounded down).
- It attempts to find a volume number in the form `vXX`. This can have a decimal. If the volume number is not found, it is omitted.
- It attempts to find a release group in the form `[Release Group]`. If not found, it is omitted.