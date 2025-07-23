@echo off
setlocal enabledelayedexpansion

:: 删除旧的临时文件
del /q *_temp.mp3

:: 遍历当前目录及子目录下所有 .mp3 文件
for /R %%f in (*.mp3) do (
    echo 正在压缩并替换: "%%f"

    :: 使用 ffmpeg 压缩 MP3 并输出到临时文件
    ffmpeg -i "%%f" -codec:a libmp3lame -b:a 192k -ar 44100 -vn -y "%%f_temp.mp3"
    
    if errorlevel 1 (
        echo 压缩失败: "%%f"
    ) else (
        :: 替换原始文件
        move /y "%%f_temp.mp3" "%%f"
    )
)

echo.
echo 所有文件已压缩并替换完成！
pause