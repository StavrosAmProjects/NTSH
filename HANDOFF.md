# Ensinesthisi.cy — Mac and Work Mode handoff

## Put project in the requested folder

Move the extracted `Ensinesthisi.cy` folder to:

```text
/Users/Ambizas/Downloads/00 Projects/Random Projects/Ensinesthisi.cy
```

The folder contains its own initialized Git repository. Do not place it inside another project's repository.

## Open the local preview

In Terminal:

```sh
cd "/Users/Ambizas/Downloads/00 Projects/Random Projects/Ensinesthisi.cy"
python3 app.py
```

Open `http://127.0.0.1:8765`. Keep Terminal open. Stop with `Control+C`.

## Create the GitHub repository

Recommended initial visibility: **Private**. The product concerns sensitive incident reports and the source has not had security review.

After authenticating GitHub CLI to the `StavrosAmProjects` organization, run from the project folder:

```sh
gh auth login --hostname github.com --web
gh repo create StavrosAmProjects/Ensinesthisi.cy --private --source=. --remote=origin --push
```

This creates the remote repo and pushes the existing commits. If GitHub says the organization name is not an account you can create repositories under, stop and confirm the correct owner; do not create it under a different account.

## Open as a separate Work Mode project

1. Use the Work Mode project's **Open** or repository picker to select this exact folder or its GitHub repository.
2. Name the project `Ensinesthisi.cy`.
3. Keep it separate from `Stavros Ambizas Personal Projects` and any other project container.
4. Add this repository's `AGENTS.md` as the project instruction file if Work Mode asks for project instructions.
5. Start with the prompt below.

### First prompt to use

```text
Continue Ensinesthisi.cy from this repository only. Read AGENTS.md, README.md, PROJECT-BRIEF.md, docs/STATUS.md, and HANDOFF.md. Keep the project standalone. Do not read or sync any of my other projects. First confirm the repository root and current Git branch, then inspect the existing prototype and continue the next implementation task from docs/IMPLEMENTATION_BACKLOG.md. Do not claim production security, legal approval, trusted capture, device attestation, or authority integration unless it has been implemented and tested with evidence.
```

## Confirm repo state

```sh
git status
git log -2 --oneline
git remote -v
```

The preview is a local synthetic demo. It accepts fixed fictional scenarios and creates in-memory demo IDs only; it does not accept or transmit real reports.
