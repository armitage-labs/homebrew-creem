# typed: false
# frozen_string_literal: true

class Creem < Formula
  desc "Command-line interface for Creem"
  homepage "https://creem.io"
  url "https://github.com/armitage-labs/creem-cli/releases/download/v0.1.2/creem-cli-0.1.2.tgz"
  sha256 "4d7662a6311ab5b7fb0c23d9ed2ccfd71569c328505270fb5a80d6fe2da90c85"
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
