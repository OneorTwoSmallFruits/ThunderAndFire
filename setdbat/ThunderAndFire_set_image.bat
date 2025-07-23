@echo off
setlocal enabledelayedexpansion

rem 遍历当前目录及其子目录中的所有 .jpg 文件
for /r %%f in (*.jpg) do (
    rem 使用 ffmpeg 优化 .jpg 文件
    ffmpeg -i "%%f" "%%~dpnf_temp.jpg" -y

    rem 比较原始文件和优化后文件的大小
    for %%s in ("%%f") do set "original_size=%%~zs"
    for %%s in ("%%~dpnf_temp.jpg") do set "optimized_size=%%~zs"

    rem 如果优化后的文件更小，则替换原始文件
    if !optimized_size! lss !original_size! (
        move /y "%%~dpnf_temp.jpg" "%%f"
        echo Replaced with optimized file: "%%f"
    ) else (
        rem 如果优化后的文件不更小，则删除临时文件
        del "%%~dpnf_temp.jpg"
        echo Optimization did not reduce file size, keeping original: "%%f"
    )
)

endlocal