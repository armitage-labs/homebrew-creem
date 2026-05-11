# typed: false
# frozen_string_literal: true

class Creem < Formula
  desc "Command-line interface for Creem"
  homepage "https://creem.io"
  url "https://github.com/armitage-labs/creem-cli/releases/download/v0.2.0/creem-cli-0.2.0.tgz"
  sha256 "1851e47ebc93b0b7ca91b8351932ad91fa112a62c5a1926466815a6befafb23c"
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
