# typed: false
# frozen_string_literal: true

class Creem < Formula
  desc "Command-line interface for Creem"
  homepage "https://creem.io"
  url "https://github.com/armitage-labs/creem-cli/releases/download/v0.1.0/creem-cli-0.1.0.tgz"
  sha256 "ef1ac4e0b71cc2fea07b066d10c0d539b3c980c40f45fb687c113086f9f08b3b"
  license "MIT"

  depends_on "node@18"

  def install
    system "npm", "install", *std_npm_args
    bin.install_symlink Dir["#{libexec}/bin/*"]
  end

  test do
    assert_match version.to_s, shell_output("#{bin}/creem --version")
  end
end
