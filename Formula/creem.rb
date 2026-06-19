# typed: false
# frozen_string_literal: true

class Creem < Formula
  desc "Command-line interface for Creem"
  homepage "https://creem.io"
  url "https://registry.npmjs.org/@creem_io/cli/-/cli-0.2.1.tgz"
  version "0.2.1"
  sha256 "bdeca29f8a5a9eacaabf54b2ea6774a7e8b8f5f8453ea532322780955b14215b"
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
