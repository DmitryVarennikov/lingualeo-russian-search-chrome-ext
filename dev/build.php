<?php

if (!isRoot()) {
    echo 'You are not in the root directory, root directory is where manifest.json located', PHP_EOL;
    exit;
}

if (empty($argv[1]) || !file_exists($argv[1])) {
    echo 'First argument must be a valid output directory, e.g.:', PHP_EOL;
    echo sprintf('php %s <output-dir>', $argv[0]), PHP_EOL;
    exit;
}

$outputDir = rtrim($argv[1], '/');

createBuild();
copyFiles($outputDir);
alterManifest($outputDir);
removeBuild();


function isRoot()
{
    return file_exists(getcwd() . '/manifest.json');
}

function execute($cmd)
{
    $handle = popen($cmd, 'r');
    if (false !== $handle) {
        while (false !== ($buffer = fgets($handle))) {
            echo $buffer;
        }
        $statusCode = pclose($handle);
        if (0 !== $statusCode) {
            echo 'Error while opening process file pointer, status code: ', $statusCode, PHP_EOL;
            exit(1);
        }
    } else {
        echo 'Failed to execute cmd: "', $cmd, '"', PHP_EOL;
        exit(1);
    }
}

function createBuild()
{
    $cmd = sprintf(
        'r.js -o baseUrl=. name=scripts/content-script out=scripts/content-script-build-%s.js paths.text=scripts/text paths.google-analytics=empty:',
        date('Y-m-d')
    );
    execute($cmd);
}

function copyFiles($outputDir)
{
    $cmd = sprintf('rm -rf %s/*', $outputDir);
    execute($cmd);

    // images
    $cmd = 'cp -r images ' . $outputDir;
    execute($cmd);

    // scripts
    $cmd = sprintf('mkdir %s/scripts', $outputDir);
    execute($cmd);

    $cmd = sprintf('cp scripts/require.js %s/scripts/', $outputDir);
    execute($cmd);

    $cmd = sprintf('cp scripts/require-cs.js %s/scripts/', $outputDir);
    execute($cmd);

    $cmd = sprintf('cp scripts/content-script-build-%s.js %s/scripts/', date('Y-m-d'), $outputDir);
    execute($cmd);

    $cmd = 'cp background.html ' . $outputDir;
    execute($cmd);

    $cmd = 'cp manifest.json ' . $outputDir;
    execute($cmd);
}

function alterManifest($outputDir)
{
    $manifestFileName = $outputDir . '/manifest.json';
    $content          = json_decode(file_get_contents($manifestFileName), true);

    // replace main entry script with a built one
    $contentScriptBuildName = sprintf('scripts/content-script-build-%s.js', date('Y-m-d'));
    foreach ($content['content_scripts'][0]['js'] as $index => $scriptName) {
        if ('scripts/content-script.js' === $scriptName) {
            $content['content_scripts'][0]['js'][$index] = $contentScriptBuildName;
            break;
        }
    }

    // thin out web accessible resources
    foreach ($content['web_accessible_resources'] as $index => $resource) {
        if ('manifest.json' !== $resource) {
            unset($content['web_accessible_resources'][$index]);
        }
    }

    $bytes = file_put_contents(
        $manifestFileName,
        json_encode($content, ~JSON_HEX_APOS & ~JSON_FORCE_OBJECT | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT)
    );
    if (!$bytes) {
        echo 'Error: "' . $manifestFileName . '" was not saved!', PHP_EOL;
    }
}

function removeBuild()
{
    $cmd = sprintf('rm scripts/content-script-build-%s.js', date('Y-m-d'));
    execute($cmd);
}
