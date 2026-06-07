package com.example.CodePilot;

import org.springframework.stereotype.Component;

@Component
public class Banner {

    private static final String ESC        = String.valueOf((char) 27);
    private static final String ANSI_RESET = ESC + "[0m";
    private static final String ANSI_BOLD  = ESC + "[1m";
    private static final String ANSI_CYAN  = ESC + "[36m";
    private static final String ANSI_GRAY  = ESC + "[90m";

    private static final int BOX_WIDTH = 60;

    public void print() {
        String cwd = System.getProperty("user.dir");

        String welcome     = ANSI_CYAN + ANSI_BOLD + "✦ Welcome to CodePilot!" + ANSI_RESET;
        String commandHint = ANSI_GRAY + "/help for commands  ·  /exit to quit" + ANSI_RESET;
        String cwdLine     = ANSI_GRAY + "cwd: " + ANSI_RESET + cwd;

        System.out.println();
        System.out.println(ANSI_CYAN + topBorder() + ANSI_RESET);
        System.out.println(boxLine(" " + welcome));
        System.out.println(boxLine(""));
        System.out.println(boxLine("   " + commandHint));
        System.out.println(boxLine(""));
        System.out.println(boxLine("   " + cwdLine));
        System.out.println(ANSI_CYAN + bottomBorder() + ANSI_RESET);
        System.out.println();
    }

    private String topBorder() {
        return "╭" + "─".repeat(BOX_WIDTH - 2) + "╮";
    }

    private String bottomBorder() {
        return "╰" + "─".repeat(BOX_WIDTH - 2) + "╯";
    }

    private String boxLine(String content) {
        int visibleLen = visibleLength(content);
        int padding    = Math.max(0, BOX_WIDTH - 2 - visibleLen - 1);
        String side    = ANSI_CYAN + "│" + ANSI_RESET;
        return side + " " + content + " ".repeat(padding) + side;
    }

    private int visibleLength(String s) {
        return s.replaceAll(ESC + "\\[[;\\d]*m", "").length();
    }
}
