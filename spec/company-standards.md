# 🏢 Padrões Extraídos dos Plugins do VS Code

> **Sincronizado em:** `2026-10-10T23:29:51.836Z` | **Plugins Mapeados:** **31**

Este documento consolida automaticamente as regras, participantes de chat, snippets e configurações extraídos das extensões instaladas no VS Code desta máquina para guiar a **Squad de Agentes (`@architect`, `@dev`, `@sec`, `@qa`)**.

---

## 🔌 CodeSnap (`adpyke.codesnap` v1.3.4)
> 📷 Take beautiful screenshots of your code

### ⚙️ Regras e Configurações Padrão:
- `codesnap.backgroundColor` = `"#abb8c3"` — The background color of the snippet's container
- `codesnap.boxShadow` = `"rgba(0, 0, 0, 0.55) 0px 20px 68px"` — The CSS box-shadow for the snippet
- `codesnap.containerPadding` = `"3em"` — The padding for the snippet's container
- `codesnap.roundedCorners` = `true` — Use rounded corners for the window
- `codesnap.showWindowControls` = `true` — Display OS X style window controls
- `codesnap.showWindowTitle` = `false` — Display window title with open folder / file name

---

## 🔌 AWS Toolkit (`amazonwebservices.aws-toolkit-vscode` v4.17.0)
> Including CodeCatalyst, Infrastructure Composer, and support for Lambda, S3, CloudWatch Logs, CloudFormation, and many other services.

### ⚙️ Regras e Configurações Padrão:
- `aws.profile` = `undefined` — %AWS.configuration.profileDescription%
- `aws.ecs.openTerminalCommand` = `"/bin/sh"` — %AWS.configuration.description.ecs.openTerminalCommand%
- `aws.iot.maxItemsPerPage` = `100` — %AWS.configuration.description.iot.maxItemsPerPage%
- `aws.s3.maxItemsPerPage` = `300` — %AWS.configuration.description.s3.maxItemsPerPage%
- `aws.samcli.location` = `""` — %AWS.configuration.description.samcli.location%
- `aws.samcli.lambdaTimeout` = `90000` — %AWS.configuration.description.samcli.lambdaTimeout%

---

## 🔌 ESLint (`dbaeumer.vscode-eslint` v3.0.34)
> Integrates ESLint JavaScript into VS Code.

### ⚙️ Regras e Configurações Padrão:
- `eslint.enable` = `true` — Controls whether eslint is enabled or not.
- `eslint.packageManager` = `"npm"` — The package manager you use to install node modules.
- `eslint.problems.shortenToSingleLine` = `false` — Shortens the text spans of underlined problems to their first related line.
- `eslint.nodeEnv` = `null` — The value of `NODE_ENV` to use when running eslint tasks.
- `eslint.nodePath` = `null` — A path added to `NODE_PATH` when resolving the eslint module.
- `eslint.options` = `{}` — The eslint options object to provide args normally passed to eslint when executed from a command line (see https://eslint.org/docs/developer-guide/nodejs-api#eslint-class).

---

## 🔌 Docker DX (`docker.docker` v0.18.0)
> Edit smarter, ship faster with an enhanced Docker-development experience

### ⚙️ Regras e Configurações Padrão:
- `docker.extension.enableComposeLanguageServer` = `true` — Enable Compose editing features from the Docker DX extension. Note that changing this value requires a restart of Visual Studio Code to take effect.
- `docker.extension.dockerEngineAvailabilityPrompt` = `true` — Be notified when Docker Engine is not available.
- `docker.extension.editor.dockerfileBuildStageDecorationLines` = `true` — Render a divider line between each build stage of a Dockerfile.
- `docker.lsp.telemetry` = `"all"` — Determines what telemetry is collected by Docker. If vscode.env.isTelemetryEnabled is false, then telemetry collection is disabled regardless of what has been set for this configuration value.
- `docker.lsp.debugServerPort` = `null` — Enter the port on localhost where the language server is running, used for debugging.
- `docker.lsp.experimental.vulnerabilityScanning` = `true` — Enable image analysis of Dockerfiles (Experimental)

---

## 🔌 eslint-disable-snippets (`drknoxy.eslint-disable-snippets` v1.4.1)
> Simple snippets to disable eslint rules

### 📝 Templates & Snippets de Código:
- **Linguagem (javascript):** `eslint-disable` (eslint-disable), `eslint-disable-line` (eslint-disable-line), `eslint-disable-next-line` (eslint-disable-next-line)
- **Linguagem (javascriptreact):** `eslint-disable` (eslint-disable), `eslint-disable-line` (eslint-disable-line), `eslint-disable-next-line` (eslint-disable-next-line)
- **Linguagem (typescript):** `eslint-disable` (eslint-disable), `eslint-disable-line` (eslint-disable-line), `eslint-disable-next-line` (eslint-disable-next-line)
- **Linguagem (typescriptreact):** `eslint-disable` (eslint-disable), `eslint-disable-line` (eslint-disable-line), `eslint-disable-next-line` (eslint-disable-next-line)
- **Linguagem (vue):** `eslint-disable` (eslint-disable), `eslint-disable-line` (eslint-disable-line), `eslint-disable-next-line` (eslint-disable-next-line)

---

## 🔌 %gitlens.displayName% (`eamodio.gitlens` v19.3.0)
> %gitlens.description%

### ⚙️ Regras e Configurações Padrão:
- `gitlens.currentLine.enabled` = `true` — %config.currentLine.enabled.markdownDescription%
- `gitlens.currentLine.pullRequests.enabled` = `true` — %config.currentLine.pullRequests.enabled.markdownDescription%
- `gitlens.currentLine.format` = `"${author, }${agoOrDate}${' via  'pullRequest}${ • message|50?}"` — %config.currentLine.format.markdownDescription%
- `gitlens.currentLine.uncommittedChangesFormat` = `null` — %config.currentLine.uncommittedChangesFormat.markdownDescription%
- `gitlens.currentLine.fontFamily` = `""` — %config.currentLine.fontFamily.markdownDescription%
- `gitlens.currentLine.fontSize` = `0` — %config.currentLine.fontSize.markdownDescription%

---

## 🔌 HTML CSS Support (`ecmel.vscode-html-css` v2.0.14)
> CSS Intellisense for HTML

### ⚙️ Regras e Configurações Padrão:
- `css.enabledLanguages` = `["html"]` — List of languages which suggestions are desired.
- `css.styleSheets` = `[]` — List of local or remote style sheets for suggestions.
- `css.autoValidation` = `"Never"` — When to validate class selectors.

---

## 🔌 Prettier - Code formatter (`esbenp.prettier-vscode` v12.4.0)
> Code formatter using prettier

### ⚙️ Regras e Configurações Padrão:
- `prettier.enable` = `true` — %ext.config.enable%
- `prettier.requireConfig` = `false` — %ext.config.requireConfig%
- `prettier.resolveGlobalModules` = `false` — %ext.config.resolveGlobalModules%
- `prettier.withNodeModules` = `false` — %ext.config.withNodeModules%
- `prettier.packageManager` = `"npm"` — %ext.config.packageManager%
- `prettier.useEditorConfig` = `true` — %ext.config.useEditorConfig%

---

## 🔌 Auto Close Tag (`formulahendry.auto-close-tag` v0.5.15)
> Automatically add HTML/XML close tag, same as Visual Studio IDE or Sublime Text

### ⚙️ Regras e Configurações Padrão:
- `auto-close-tag.activationOnLanguage` = `["xml","php","blade","ejs","jinja","javascript","javascriptreact","typescript","typescriptreact","plaintext","markdown","vue","liquid","erb","lang-cfml","cfml","HTML (EEx)","HTML (Eex)","plist"]` — Set the languages that the extension will be activated.  e.g. ["html","xml","php"]. Use ["*"] to activate for all languages.
- `auto-close-tag.disableOnLanguage` = `[]` — Set the languages where the extension will be disabled.  e.g. ["html","xml","php"].
- `auto-close-tag.excludedTags` = `["area","base","br","col","command","embed","hr","img","input","keygen","link","meta","param","source","track","wbr"]` — Set the tag list that would not be auto closed.
- `auto-close-tag.SublimeText3Mode` = `false` — Auto close tag when </ is typed, same as Sublime Text 3
- `auto-close-tag.enableAutoCloseTag` = `true` — Whether to insert close tag automatically
- `auto-close-tag.enableAutoCloseSelfClosingTag` = `true` — Whether to close self-closing tag automatically

---

## 🔌 Auto Rename Tag (`formulahendry.auto-rename-tag` v0.1.10)
> Auto rename paired HTML/XML tag

### ⚙️ Regras e Configurações Padrão:
- `auto-rename-tag.activationOnLanguage` = `["*"]` — Set the languages that the extension will be activated.  e.g. ["html","xml","php"] By default, it is ["*"] and will be activated for all languages.

---

## 🔌 CodeMetrics (`kisstkondoros.vscode-codemetrics` v1.26.1)
> Computes complexity in TypeScript / JavaScript files.

### ⚙️ Regras e Configurações Padrão:
- `codemetrics.basics.Exclude` = `[]` — Array of exclusion patterns (in glob format)
- `codemetrics.basics.OverviewRulerModeEnabled` = `true` — A flag which indicates whether code metrics are shown on the overview ruler
- `codemetrics.basics.DecorationModeEnabled` = `true` — A flag which indicates whether code metrics are shown as inline decoration
- `codemetrics.basics.DecorationTemplate` = `"<svg xmlns='http://www.w3.org/2000/svg' width='{{size}}px' height='{{size}}px' viewbox='0 0 {{size}} {{size}}'><rect width='{{size}}' height='{{size}}' style='fill:{{color}};stroke-width:1;stroke:#fff'/></svg>"` — A flag which indicates whether code metrics are shown as inline decoration
- `codemetrics.basics.CodeLensEnabled` = `true` — A flag which indicates whether code metrics are shown as code lens
- `codemetrics.basics.DiagnosticsEnabled` = `false` — A flag which indicates whether code metrics are shown as diagnostics

---

## 🔌 Container Tools (`ms-azuretools.vscode-containers` v2.5.2)
> Makes it easy to create, manage, and debug containerized applications.

### ⚙️ Regras e Configurações Padrão:
- `containers.promptForRegistryWhenPushingImages` = `true` — %vscode-containers.config.containers.promptForRegistryWhenPushingImages%
- `containers.commands.build` = `"${containerCommand} build --pull ${rm} -f \"${dockerfile}\" -t ${tag} \"${context}\""` — %vscode-containers.config.template.build.description%
- `containers.commands.run` = `"${containerCommand} run --rm -d ${exposedPorts} ${tag}"` — %vscode-containers.config.template.run.description%
- `containers.commands.runInteractive` = `"${containerCommand} run --rm -it ${exposedPorts} ${tag}"` — %vscode-containers.config.template.runInteractive.description%
- `containers.commands.attach` = `"${containerCommand} exec -it ${containerId} ${shellCommand}"` — %vscode-containers.config.template.attach.description%
- `containers.commands.logs` = `"${containerCommand} logs --tail 1000 -f ${containerId}"` — %vscode-containers.config.template.logs.description%

---

## 🔌 %displayName% (`ms-vscode-remote.remote-containers` v0.469.0)
> %description%

### ⚙️ Regras e Configurações Padrão:
- `dev.containers.defaultExtensions` = `[]` — %configuration.defaultExtensions.description%
- `dev.containers.defaultFeatures` = `{}` — %configuration.defaultFeatures%
- `dev.containers.workspaceMountConsistency` = `"cached"` — %configuration.workspaceMountConsistency.description%
- `dev.containers.gpuAvailability` = `"detect"` — %configuration.gpuAvailability.description%
- `dev.containers.cacheVolume` = `true` — %configuration.cacheVolume.description%
- `dev.containers.copyGitConfig` = `true` — %configuration.copyGitConfig.markdownDescription%

---

## 🔌 Remote - SSH (`ms-vscode-remote.remote-ssh` v0.128.0)
> %description%

### 🤖 Agentes / Chat Participants do Plugin:
- **@remote-ssh** (`remote-ssh`): %chatParticipants.description%

### ⚙️ Regras e Configurações Padrão:
- `remote.SSH.configFile` = `""` — %setting.configFile.description%
- `remote.SSH.showLoginTerminal` = `false` — %setting.showLoginTerminal.description%
- `remote.SSH.defaultForwardedPorts` = `[]` — %setting.defaultForwardedPorts.description%
- `remote.SSH.defaultExtensions` = `undefined` — %setting.defaultExtensions.description%
- `remote.SSH.path` = `""` — %setting.path.description%
- `remote.SSH.serverInstallPath` = `undefined` — %setting.serverInstallPath.description%

---

## 🔌 %displayName% (`ms-vscode-remote.remote-wsl` v0.104.3)
> %description%

### ⚙️ Regras e Configurações Padrão:
- `remote.WSL.fileWatcher.polling` = `false` — %settings.remote.WSL.fileWatcher.polling%
- `remote.WSL.fileWatcher.pollingInterval` = `5000` — %settings.remote.WSL.fileWatcher.pollingInterval%
- `remote.WSL.debug` = `false` — %settings.remote.WSL.debug%
- `remote.WSL.useShellEnvironment` = `true` — %settings.remote.WSL.useShellEnvironment%
- `remote.WSL.downloadInBackground` = `true` — %settings.remote.WSL.downloadInBackground%
- `remote.WSL.experimental.scriptLessStartup` = `false` — %settings.remote.WSL.experimental.scriptLessStartup%

---

## 🔌 %displayName% (`ms-vscode.remote-explorer` v0.5.0)
> %description%

### ⚙️ Regras e Configurações Padrão:
- `remote-explorer.foldersSortOrder` = `"most recently used"` — %settings.foldersSortOrder.description%
- `remote-explorer.collapseRecentFolders` = `false` — %settings.collapseRecentFolders.description%

---

## 🔌 %extension.liveshare.displayName.title% (`ms-vsliveshare.vsliveshare` v1.1.122)
> %extension.liveshare.description.title%

### ⚙️ Regras e Configurações Padrão:
- `liveshare.anonymousGuestApproval` = `"prompt"` — %extension.liveshare.anonymousGuestApproval.title%
- `liveshare.launcherClient` = `"web"` — %extension.liveshare.launcherClient.title%
- `liveshare.diagnosticLoggingLevel` = `"Warning"` — %extension.liveshare.diagnosticLoggingLevel.title%
- `liveshare.diagnosticLogging` = `false` — %extension.liveshare.diagnosticLogging.title%
- `liveshare.diagnosticMode` = `false` — %extension.liveshare.diagnosticMode.title%
- `liveshare.connectionMode` = `"auto"` — %extension.liveshare.connectionMode.title%

---

## 🔌 Color Highlight (`naumovs.color-highlight` v2.8.0)
> Highlight web colors in your editor

### ⚙️ Regras e Configurações Padrão:
- `color-highlight.enable` = `true` — Controls if plugin is enabled
- `color-highlight.languages` = `["*"]` — An array of language ids which should be highlighted by Color Highlight. "*" to trigger on any language; Prepend language id with "!" to exclude the language (i.e "!typescript", "!javascript")
- `color-highlight.matchWords` = `false` — Highlight color words in all files (grey, green, etc.)
- `color-highlight.useARGB` = `false` — Highlight HEX values using ARGB instead of RGBA (default)
- `color-highlight.matchRgbWithNoFunction` = `false` — Highlight rgb without functions like rgb() ('255, 255, 255', [255, 255, 255], '255 255 255', etc.)
- `color-highlight.rgbWithNoFunctionLanguages` = `["*"]` — An array of language ids which should be highlighted by Color Highlight with the rgbWithNoFunction pattern. "*" to trigger on any language; Prepend language id with "!" to exclude the language (i.e "!typescript", "!javascript")

---

## 🔌 Polacode (`pnp.polacode` v0.3.4)
> 📸  Polaroid for your code

### ⚙️ Regras e Configurações Padrão:
- `polacode.shadow` = `"rgba(0, 0, 0, 0.55) 0px 20px 68px"` — Shadow of the snippet node. Use any value for CSS `box-shadow`
- `polacode.transparentBackground` = `false` — Transparent background for containers
- `polacode.backgroundColor` = `"#f2f2f2"` — Background color of snippet container. Use any value for CSS `background-color`
- `polacode.target` = `"container"` — Shoot with or without container

---

## 🔌 CSS Peek (`pranaygp.vscode-css-peek` v4.4.3)
> Allow peeking to css ID and class strings as definitions from html files to respective CSS. Allows peek and goto definition.

### ⚙️ Regras e Configurações Padrão:
- `cssPeek.enable` = `true` — Controls the enablement.
- `cssPeek.supportTags` = `true` — Enable Peeking from HTML tags in addition to classnames and IDs. React components are ignored, but it's a good idea to disable this feature when using Angular
- `cssPeek.peekFromLanguages` = `["html","django-html","laravel-blade","razor","vue","blade","pug","jade","handlebars","php","twig","md","nunjucks","javascript","javascriptreact","erb","typescript","typescriptreact","HTML (Eex)","html-eex","ejs","hbs","svelte"]` — A list of vscode language names where the extension should be used.
- `cssPeek.peekToExclude` = `["**/node_modules/**","**/bower_components/**"]` — A list of file globs that filters out peekable files
- `cssPeek.trace.server` = `"off"` — Traces the communication between VSCode and the language server.

---

## 🔌 Red Hat Dependency Analytics (`redhat.fabric8-analytics` v1.1.0)
> Provides insights on security vulnerabilities and license compatibility in your application dependencies.

### ⚙️ Regras e Configurações Padrão:
- `redhat.telemetry.enabled` = `null` — Enable usage data and errors to be sent to Red Hat servers. Read our [privacy statement](https://developers.redhat.com/article/tool-data-collection).
- `redHatDependencyAnalytics.backendUrl` = `"https://rhda.rhcloud.com"` — Red Hat Dependency Analytics backend URL to use for stack, component & image analysis.
- `redHatDependencyAnalytics.matchManifestVersions` = `true` — Restricts RHDA from performing analysis on dependency tags that do not match the tags requested within the manifest files.
- `redHatDependencyAnalytics.reportFilePath` = `"/tmp/redhatDependencyAnalyticsReport.html"` — Path to a local file where the Red Hat Dependency Analytics report will be saved.
- `redHatDependencyAnalytics.mvn.executable.path` = `""` — Specifies absolute path of mvn executable.
- `redHatDependencyAnalytics.mvn.preferWrapper` = `"fallback"` — Specifies whether to use the local maven wrapper. The 'fallback' option will default to the value of `#maven.executable.preferMavenWrapper#` from the `Maven for Java` extension, else defaulting to 'true'.

---

## 🔌 Red Hat Commons (`redhat.vscode-commons` v0.0.6)
> Base utilities for Red Hat extensions. Notably controls telemetry settings.

### ⚙️ Regras e Configurações Padrão:
- `redhat.telemetry.enabled` = `false` — Enable usage data and errors to be sent to Red Hat servers. Read our [privacy statement](https://developers.redhat.com/article/tool-data-collection).

---

## 🔌 YAML (`redhat.vscode-yaml` v1.25.0)
> YAML Language Support by Red Hat, with built-in Kubernetes syntax support

### ⚙️ Regras e Configurações Padrão:
- `redhat.telemetry.enabled` = `null` — Enable usage data and errors to be sent to Red Hat servers. Read our [privacy statement](https://developers.redhat.com/article/tool-data-collection).
- `yaml.yamlVersion` = `"1.2"` — Default YAML spec version
- `yaml.trace.server` = `"off"` — Traces the communication between VSCode and the YAML language service.
- `yaml.schemas` = `{}` — Associate schemas to YAML files in the current workspace. The expected value of this configuration option is a string to string map: - **Key**: The path or URL of the schema to use - **Value**: A glob pattern or list of glob patterns specifying which files the schema should be used on. Prefix a pattern with `!` to exclude matching files; at least one positive pattern is required.
- `yaml.disableSchemaDetection` = `[]` — Disable schema detection for YAML files matching the configured glob pattern or list of glob patterns. Modelines still apply.
- `yaml.kubernetesCRDStore.enable` = `true` — Enable/disable validation of Kubernetes custom resources using schemas from well-known Custom Resource Definitions (CRDs)

---

## 🔌 Prettier ESLint (`rvest.vs-code-prettier-eslint` v6.0.0)
> A Visual Studio Extension to format JavaScript and Typescript code using prettier-eslint package

### ⚙️ Regras e Configurações Padrão:
- `vs-code-prettier-eslint.prettierLast` = `false` — Run Prettier Last

---

## 🔌 Svg Preview (`simonsiefke.svg-preview` v2.8.3)
> Preview for Svg files

### ⚙️ Regras e Configurações Padrão:
- `svgPreview.autoOpen` = `true` — Automatically open the preview when an svg file is opened.
- `svgPreview.scaleToFit` = `true` — Whether or not the svg should be scaled to fit the viewport or keep its original size
- `svgPreview.style` = `{}` — Custom style for the preview.

---

## 🔌 Auto Import (`steoates.autoimport` v1.5.4)
> Automatically finds, parses and provides code actions and code completion for all available imports. Works with Typescript and TSX

### ⚙️ Regras e Configurações Padrão:
- `autoimport.filesToScan` = `"**/*.{ts,tsx}"` — Glob for files to watch and scan, e.g ./src/** ./src/app/**/*.ts. Defaults to **/*.{ts,tsx}
- `autoimport.showNotifications` = `false` — Specifies wether to show notifications from Auto Import
- `autoimport.doubleQuotes` = `false` — Specifies wether to use double quotes
- `autoimport.spaceBetweenBraces` = `true` — Specifies wether to use spaces between first and last brace
- `autoimport.autoComplete` = `true` — Adds found items to intellisense and automatically imports then
- `autoimport.useSemiColon` = `true` — Use ; at the end of a line e.g Import * from ./app or Import * from ./app; - Default True

---

## 🔌 Stylelint (`stylelint.vscode-stylelint` v2.2.1)
> Official Stylelint extension for Visual Studio Code

### ⚙️ Regras e Configurações Padrão:
- `stylelint.enable` = `true` — Control whether Stylelint is enabled or not.
- `stylelint.run` = `"onType"` — Control when the extension lints your files. onType lints files as you edit them, while onSave only lints when you save the file.
- `stylelint.logLevel` = `"info"` — Controls the log level used by the Stylelint extension and language server. Restart the extension host or the window after changing the setting, since it's picked up at initialization.
- `stylelint.runtime` = `null` — The location of the node binary to run Stylelint under.
- `stylelint.execArgv` = `null` — Additional exec argv arguments passed to the Node.js runtime.
- `stylelint.codeAction.disableRuleComment` = `{"location":"separateLine"}` — Options for the disable lint rule action in the quick fix menu.

---

## 🔌 Concourse CI Pipeline Editor (`vmware.vscode-concourse` v1.56.0)
> Provides validation and content assist for Concourse CI pipeline and task configuration yml files

### ⚙️ Regras e Configurações Padrão:
- `concourse.ls.logfile` = `undefined` — The path of a file to write language server logs. If not set or null, then logs are discarded.
- `concourse.ls.java.heap` = `undefined` — Passed as an `-Xmx` argument to the language server JVM process
- `concourse.ls.java.home` = `undefined` — Overrides JAVA_HOME used for launching the language server JVM process
- `concourse.ls.java.vmargs` = `undefined` — Additional 'user defined' VM args to pass to the language server process.

---

## 🔌 Cloudfoundry Manifest YML Support (`vmware.vscode-manifest-yaml` v1.56.0)
> Adds linting, content assist and hoverinfo's for Cloudfoundry Deployment Manifests (a.k.a. `manifest.yml`) files.

### ⚙️ Regras e Configurações Padrão:
- `cloudfoundry-manifest.ls.logfile` = `undefined` — The path of a file to write language server logs. If not set or null, then logs are discarded.
- `cloudfoundry-manifest.ls.java.heap` = `undefined` — Passed as an `-Xmx` argument to the language server JVM process
- `cloudfoundry-manifest.ls.java.home` = `undefined` — Overrides JAVA_HOME used for launching the language server JVM process
- `cloudfoundry-manifest.ls.java.vmargs` = `undefined` — Additional 'user defined' VM args to pass to the language server process.

---

## 🔌 TODO Highlight (`wayou.vscode-todo-highlight` v1.0.5)
> highlight TODOs, FIXMEs, and any keywords, annotations...

### ⚙️ Regras e Configurações Padrão:
- `todohighlight.isEnable` = `true` — Enable or disable the highlight
- `todohighlight.isCaseSensitive` = `true` — Specify whether the keywords are case sensitive or not
- `todohighlight.toggleURI` = `false` — If the file path within the output channel not clickable, set this to true to toggle the path patten between `<path>#<line>` and `<path>:<line>:<column>`
- `todohighlight.keywords` = `undefined` — Customize keywords and colors. Any css color identifier is valid.
- `todohighlight.keywordsPattern` = `""` — Specify keywords via RegExp instead of `todohighlight.keywords` one by one. NOTE that if this presents, `todohighlight.keywords` will be ignored. And REMEMBER to escapse the back slash if there's any in your regexp (using \\ instead of single back slash)
- `todohighlight.defaultStyle` = `undefined` — Default style for all customized keywords

---

## 🔌 IntelliSense for CSS class names in HTML (`zignd.html-css-class-completion` v1.20.0)
> CSS class name completion for the HTML class attribute based on the definitions found in your workspace.

### ⚙️ Regras e Configurações Padrão:
- `html-css-class-completion.includeGlobPattern` = `"**/*.{css,html}"` — A glob pattern that defines files and folders to search for. The glob pattern will be matched against the paths of resulting matches relative to their workspace.
- `html-css-class-completion.excludeGlobPattern` = `""` — A glob pattern that defines files and folders to exclude. The glob pattern will be matched against the file paths of resulting matches relative to their workspace.
- `html-css-class-completion.enableEmmetSupport` = `false` — Enables completion when you're writing Emmet abbreviations.
- `html-css-class-completion.HTMLLanguages` = `["html","vue","razor","blade","handlebars","twig","django-html","php","markdown","erb","ejs","svelte"]` — A list of HTML based languages where suggestions are enabled.
- `html-css-class-completion.CSSLanguages` = `["css","sass","scss"]` — A list of CSS based languages where suggestions are enabled.
- `html-css-class-completion.JavaScriptLanguages` = `["javascript","javascriptreact","typescriptreact"]` — A list of JavaScript based languages where suggestions are enabled.

---

