import Cocoa
let imgPath = "/Users/danielsantander/Documents/Agritwin/assets/agritwin_isotype_clean_true.png"
let targetPath = "/Users/danielsantander/Documents/Agritwin/launch-desktop.command"

if let img = NSImage(contentsOfFile: imgPath) {
    let res = NSWorkspace.shared.setIcon(img, forFile: targetPath, options: [])
    print("Finder icon updated successfully:", res)
} else {
    print("Could not load image file.")
}
