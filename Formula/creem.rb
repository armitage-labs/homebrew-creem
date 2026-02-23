# typed: false
# frozen_string_literal: true

class Creem < Formula
  desc "Command-line interface for Creem"
  homepage "https://creem.io"
  url "https://github.com/armitage-labs/creem-cli/releases/download/v0.1.3/creem-cli-0.1.3.tgz"
  sha256 "2f1e73b16e7df4df9ada6655935f752f0ff8648b6507a6ce9f61caef284e5bb9"
  license "MIT"

  depends_on "node@22"

  def install
    system "npm", "install", *std_npm_args
    bin.install_symlink Dir["#{libexec}/bin/*"]
  end

  test do
    assert_match version.to_s, shell_output("#{bin}/creem --version")
  end
end
